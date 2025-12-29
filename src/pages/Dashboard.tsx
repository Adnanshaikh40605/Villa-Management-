import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BuildingOffice2Icon, CalendarIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon, HomeIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { villas, bookings } = useData();

  const today = new Date().toISOString().split('T')[0];

  const todayCheckIns = bookings.filter(b => b.checkIn === today && b.status === 'booked');
  const todayCheckOuts = bookings.filter(b => b.checkOut === today && b.status === 'booked');

  const currentlyBookedVillas = new Set(
    bookings.filter(b => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const todayDate = new Date(today);
      return b.status === 'booked' && checkIn <= todayDate && checkOut > todayDate;
    }).map(b => b.villaId)
  ).size;

  const stats = [
    {
      title: 'Total Villas',
      value: villas.length,
      icon: BuildingOffice2Icon,
      color: 'bg-primary',
      link: '/villas',
    },
    {
      title: "Today's Check-ins",
      value: todayCheckIns.length,
      icon: CalendarDaysIcon,
      color: 'bg-available',
      link: '/bookings',
    },
    {
      title: "Today's Check-outs",
      value: todayCheckOuts.length,
      icon: CalendarIcon,
      color: 'bg-maintenance',
      link: '/bookings',
    },
    {
      title: 'Currently Booked',
      value: currentlyBookedVillas,
      icon: HomeIcon,
      color: 'bg-booked',
      link: '/calendar',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Villa Booking Manager</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-md ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/calendar">
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
              View Calendar
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/bookings">
              View All Bookings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/villas">
              Manage Villas
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Check-ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDaysIcon className="h-5 w-5 text-available" />
              Today's Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckIns.length === 0 ? (
              <p className="text-muted-foreground text-sm">No check-ins today</p>
            ) : (
              <ul className="space-y-2">
                {todayCheckIns.map((booking) => {
                  const villa = villas.find(v => v.id === booking.villaId);
                  return (
                    <li
                      key={booking.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{villa?.name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{booking.clientPhone}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Check-outs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5 text-maintenance" />
              Today's Check-outs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckOuts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No check-outs today</p>
            ) : (
              <ul className="space-y-2">
                {todayCheckOuts.map((booking) => {
                  const villa = villas.find(v => v.id === booking.villaId);
                  return (
                    <li
                      key={booking.id}
                      className="flex justify-between items-center p-2 bg-muted rounded-md"
                    >
                      <div>
                        <p className="font-medium">{booking.clientName}</p>
                        <p className="text-sm text-muted-foreground">{villa?.name}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{booking.clientPhone}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
