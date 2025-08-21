"use client";

import { Toaster } from "react-hot-toast";
import AdminLayout from "@/components/admin/AdminLayout";
import Products from "@/components/admin/Products";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Mail, BarChart3, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <>
      <Toaster position="top-right" />
      <AdminLayout activeTab="dashboard" onTabChange={() => {}}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome to the AI Routine Admin Dashboard
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Quiz Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-900">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">User Management</h4>
                  <p className="text-sm text-gray-600">
                    Add, manage, and bulk import users from the Users page
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/admin/users")}
                    className="mt-2"
                  >
                    Go to Users <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Monitor Progress
                  </h4>
                  <p className="text-sm text-gray-600">
                    Track quiz completion rates and user engagement
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Product Management
                  </h4>
                  <p className="text-sm text-gray-600">
                    Manage skincare products and bulk upload from the Products
                    page
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/admin/products")}
                    className="mt-2"
                  >
                    Go to Products <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user registrations and quiz completions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">
                    Start by adding some users to see activity here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
