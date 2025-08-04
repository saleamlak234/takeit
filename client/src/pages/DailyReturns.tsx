import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  ArrowRight,
  Eye
} from 'lucide-react';
import { getTimeUntilNextMidnight, formatTimeInTimezone } from '../utils/timezone';
import axios from 'axios';

interface DailyReturn {
  _id: string;
  amount: number;
  dayNumber: number;
  scheduledFor: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'failed' | 'cancelled';
  deposit: {
    package: string;
    amount: number;
  };
}

interface DailyReturnStats {
  totalReturns: number;
  processedReturns: number;
  pendingReturns: number;
  totalEarned: number;
  nextReturnAmount: number;
  nextReturnTime: string;
}

export default function DailyReturns() {
  const { user } = useAuth();
  const [dailyReturns, setDailyReturns] = useState<DailyReturn[]>([]);
  const [stats, setStats] = useState<DailyReturnStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    fetchDailyReturns();
    
    // Update countdown every second
    const interval = setInterval(() => {
      const timeUntilMidnight = getTimeUntilNextMidnight();
      const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilMidnight % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchDailyReturns = async () => {
    try {
      const response = await axios.get(`/daily-returns?period=${selectedPeriod}`);
      setDailyReturns(response.data.dailyReturns);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch daily returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Returns</h1>
          <p className="text-gray-600 mt-1">Track your daily investment returns and earnings</p>
        </div>

        {/* Next Return Countdown */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 mb-8 border border-primary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-200 p-3 rounded-full">
                <Clock className="h-8 w-8 text-primary-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-900">Next Daily Return</h3>
                <p className="text-primary-700">Returns are processed at midnight (your local time)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-900">{countdown}</p>
              <p className="text-primary-700">Until next return</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalReturns || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.processedReturns || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.pendingReturns || 0}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earned</p>
                <p className="text-2xl font-bold text-primary-600">
                  {(stats?.totalEarned || 0).toLocaleString()} ETB
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Returns List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Daily Returns History</h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
                <option value="today">Today</option>
              </select>
            </div>
          </div>

          {dailyReturns.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {dailyReturns.map((dailyReturn) => (
                <div key={dailyReturn._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(dailyReturn.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            Day {dailyReturn.dayNumber} Return
                          </h4>
                          <span className="text-sm text-gray-500">
                            {dailyReturn.deposit.package}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Scheduled: {new Date(dailyReturn.scheduledFor).toLocaleDateString()}
                        </p>
                        {dailyReturn.processedAt && (
                          <p className="text-xs text-gray-500">
                            Processed: {new Date(dailyReturn.processedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +{dailyReturn.amount.toLocaleString()} ETB
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(dailyReturn.status)}`}>
                        {dailyReturn.status.charAt(0).toUpperCase() + dailyReturn.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No daily returns yet</h3>
              <p className="text-gray-600 mb-6">
                Make your first deposit to start earning daily returns
              </p>
            </div>
          )}
        </div>

        {/* How Daily Returns Work */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">How Daily Returns Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Return Schedule</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Returns processed daily at midnight (your local time)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>60 days of returns for each package</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Automatic processing - no action required</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Returns added directly to your balance</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Package Returns</h4>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>1st Package: 50 ETB daily</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>2nd Package: 100 ETB daily</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>3rd Package: 200 ETB daily</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>And more... up to 7th Package: 3,200 ETB daily</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}