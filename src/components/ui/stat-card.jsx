import React from 'react';
import { Card, CardContent } from './card';
import { Loader } from './loader';
import * as LucideIcons from 'lucide-react';

export const StatCard = ({ title, value, icon, description, loading }) => {
  // Dynamically get the icon component
  const IconComponent = icon ? LucideIcons[icon] : LucideIcons.BarChart3;

  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader className="h-8 w-8 text-muted-foreground/50" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard; 