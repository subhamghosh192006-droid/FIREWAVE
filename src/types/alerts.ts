export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertType =
  | 'WIND_VEER'
  | 'NEW_HOTSPOT'
  | 'EVACUATION_ESCALATION'
  | 'CONTAINMENT_ADAPTATION'
  | 'WEATHER_SYNC'
  | 'CRITICAL_DRYING';

export interface LiveAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation: string;
}
