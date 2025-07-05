"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Bell,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  MessageSquare,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  name: string;
  type: string;
  status: "ACTIVE" | "PAUSED" | "DISABLED";
  conditions: any;
  threshold?: number;
  duration?: number;
  channels: string[];
  escalation?: any;
  monitorId?: string;
  createdAt: string;
  updatedAt: string;
  monitor?: {
    id: string;
    name: string;
    url: string;
    type: string;
    status: string;
  };
  _count: {
    incidents: number;
    notifications: number;
  };
}

interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  monitor: {
    id: string;
    name: string;
    url: string;
  };
  alert?: {
    id: string;
    name: string;
  };
}

interface Notification {
  id: string;
  type: "EMAIL" | "DISCORD" | "WEBHOOK" | "SMS" | "PUSH";
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "BOUNCED";
  recipient: string;
  subject?: string;
  content: string;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  createdAt: string;
  alert?: {
    id: string;
    name: string;
  };
  incident?: {
    id: string;
    title: string;
  };
}

interface AlertManagerProps {
  userId: string;
  monitors: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    status: string;
  }>;
  userPlan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
}

const AlertManager: React.FC<AlertManagerProps> = ({
  userId,
  monitors,
  userPlan,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "DOWN",
    monitorId: "",
    conditions: {},
    threshold: 0,
    duration: 300,
    channels: [] as string[],
    escalation: {},
  });

  // Fetch data
  useEffect(() => {
    fetchAlerts();
    fetchIncidents();
    fetchNotifications();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/alerts?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      toast.error("Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`/api/incidents?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleCreateAlert = async () => {
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
          conditions: JSON.stringify(formData.conditions),
        }),
      });

      if (response.ok) {
        toast.success("Alert created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchAlerts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create alert");
      }
    } catch (error) {
      toast.error("Failed to create alert");
    }
  };

  const handleEditAlert = async () => {
    if (!selectedAlert) return;

    try {
      const response = await fetch("/api/alerts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedAlert.id,
          ...formData,
          userId,
          conditions: JSON.stringify(formData.conditions),
        }),
      });

      if (response.ok) {
        toast.success("Alert updated successfully");
        setIsEditDialogOpen(false);
        resetForm();
        fetchAlerts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update alert");
      }
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    try {
      const response = await fetch(
        `/api/alerts?id=${alertId}&userId=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Alert deleted successfully");
        fetchAlerts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete alert");
      }
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "DOWN",
      monitorId: "",
      conditions: {},
      threshold: 0,
      duration: 300,
      channels: [],
      escalation: {},
    });
    setSelectedAlert(null);
  };

  const openEditDialog = (alert: Alert) => {
    setSelectedAlert(alert);
    setFormData({
      name: alert.name,
      type: alert.type,
      monitorId: alert.monitorId || "",
      conditions:
        typeof alert.conditions === "string"
          ? JSON.parse(alert.conditions)
          : alert.conditions,
      threshold: alert.threshold || 0,
      duration: alert.duration || 300,
      channels: alert.channels || [],
      escalation: alert.escalation || {},
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "DISABLED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return <Mail className="w-4 h-4" />;
      case "DISCORD":
        return <MessageSquare className="w-4 h-4" />;
      case "WEBHOOK":
        return <Webhook className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "SENT":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPlanLimits = () => {
    switch (userPlan) {
      case "FREE":
        return { alerts: 1, channels: ["EMAIL"] };
      case "STARTER":
        return { alerts: 5, channels: ["EMAIL", "PUSH"] };
      case "PROFESSIONAL":
        return {
          alerts: 25,
          channels: ["EMAIL", "PUSH", "DISCORD", "WEBHOOK"],
        };
      case "ENTERPRISE":
        return {
          alerts: -1,
          channels: ["EMAIL", "PUSH", "DISCORD", "WEBHOOK", "SMS"],
        };
      default:
        return { alerts: 1, channels: ["EMAIL"] };
    }
  };

  const planLimits = getPlanLimits();
  const canCreateAlert =
    planLimits.alerts === -1 || alerts.length < planLimits.alerts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>
          <p className="text-gray-600">
            Manage your monitoring alerts and notification preferences
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={!canCreateAlert}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Configure a new alert to monitor your services
              </DialogDescription>
            </DialogHeader>
            <AlertForm
              formData={formData}
              setFormData={setFormData}
              monitors={monitors}
              planLimits={planLimits}
              onSubmit={handleCreateAlert}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {!canCreateAlert && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">
                You've reached the limit of {planLimits.alerts} alerts for your{" "}
                {userPlan} plan. Upgrade to create more alerts.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="incidents">
            Incidents ({incidents.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications ({notifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No alerts configured
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first alert to get notified when monitors fail
                </p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  disabled={!canCreateAlert}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {alert.name}
                          </CardTitle>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {alert.monitor && (
                            <span>Monitor: {alert.monitor.name}</span>
                          )}
                          <span>Duration: {alert.duration || 300}s</span>
                          <span>Channels: {alert.channels.length}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(alert)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Channels:</span>
                          {alert.channels.map((channel) => (
                            <div
                              key={channel}
                              className="flex items-center gap-1"
                            >
                              {getChannelIcon(channel)}
                              <span>{channel}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{alert._count.incidents} incidents</span>
                        <span>{alert._count.notifications} notifications</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {incidents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No incidents
                </h3>
                <p className="text-gray-600">
                  All your monitors are running smoothly
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {incidents.map((incident) => (
                <Card key={incident.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {incident.title}
                          </CardTitle>
                          <Badge
                            className={getSeverityColor(incident.severity)}
                          >
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {incident.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {incident.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>Monitor: {incident.monitor.name}</span>
                        {incident.alert && (
                          <span>Alert: {incident.alert.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>
                          Created:{" "}
                          {new Date(incident.createdAt).toLocaleString()}
                        </span>
                        {incident.resolvedAt && (
                          <span>
                            Resolved:{" "}
                            {new Date(incident.resolvedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications
                </h3>
                <p className="text-gray-600">
                  Notification history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {notification.subject || "Notification"}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {getNotificationStatusIcon(notification.status)}
                            <span className="text-sm text-gray-600">
                              {notification.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getChannelIcon(notification.type)}
                            <span className="text-sm text-gray-600">
                              {notification.type}
                            </span>
                          </div>
                        </div>
                        <CardDescription>
                          {notification.content}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>To: {notification.recipient}</span>
                        {notification.alert && (
                          <span>Alert: {notification.alert.name}</span>
                        )}
                        {notification.incident && (
                          <span>Incident: {notification.incident.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span>
                          Created:{" "}
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {notification.sentAt && (
                          <span>
                            Sent:{" "}
                            {new Date(notification.sentAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {notification.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        Error: {notification.errorMessage}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
            <DialogDescription>
              Update your alert configuration
            </DialogDescription>
          </DialogHeader>
          <AlertForm
            formData={formData}
            setFormData={setFormData}
            monitors={monitors}
            planLimits={planLimits}
            onSubmit={handleEditAlert}
            onCancel={() => setIsEditDialogOpen(false)}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Alert Form Component
interface AlertFormProps {
  formData: any;
  setFormData: (data: any) => void;
  monitors: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    status: string;
  }>;
  planLimits: {
    alerts: number;
    channels: string[];
  };
  onSubmit: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const AlertForm: React.FC<AlertFormProps> = ({
  formData,
  setFormData,
  monitors,
  planLimits,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const handleChannelChange = (channel: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, channels: [...formData.channels, channel] });
    } else {
      setFormData({
        ...formData,
        channels: formData.channels.filter((c: string) => c !== channel),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Alert Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter alert name"
          />
        </div>
        <div>
          <Label htmlFor="type">Alert Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select alert type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOWN">Down</SelectItem>
              <SelectItem value="UP">Up</SelectItem>
              <SelectItem value="SLOW_RESPONSE">Slow Response</SelectItem>
              <SelectItem value="SSL_EXPIRY">SSL Expiry</SelectItem>
              <SelectItem value="KEYWORD_MISSING">Keyword Missing</SelectItem>
              <SelectItem value="KEYWORD_FOUND">Keyword Found</SelectItem>
              <SelectItem value="STATUS_CODE">Status Code</SelectItem>
              <SelectItem value="WHOP_THRESHOLD">Whop Threshold</SelectItem>
              <SelectItem value="WHOP_ANOMALY">Whop Anomaly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="monitor">Monitor</Label>
        <Select
          value={formData.monitorId}
          onValueChange={(value) =>
            setFormData({ ...formData, monitorId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select monitor" />
          </SelectTrigger>
          <SelectContent>
            {monitors.map((monitor) => (
              <SelectItem key={monitor.id} value={monitor.id}>
                {monitor.name} ({monitor.url})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            value={formData.threshold}
            onChange={(e) =>
              setFormData({ ...formData, threshold: Number(e.target.value) })
            }
            placeholder="Enter threshold value"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: Number(e.target.value) })
            }
            placeholder="Enter duration in seconds"
          />
        </div>
      </div>

      <div>
        <Label>Notification Channels</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {planLimits.channels.map((channel) => (
            <div key={channel} className="flex items-center space-x-2">
              <Checkbox
                id={channel}
                checked={formData.channels.includes(channel)}
                onCheckedChange={(checked) =>
                  handleChannelChange(channel, checked as boolean)
                }
              />
              <Label htmlFor={channel} className="text-sm font-normal">
                {channel}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {isEdit ? "Update Alert" : "Create Alert"}
        </Button>
      </div>
    </div>
  );
};

export default AlertManager;
