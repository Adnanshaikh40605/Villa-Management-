import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Villa } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Users, IndianRupee, Edit, Wrench } from 'lucide-react';
import { toast } from '@/lib/toast';

export default function Villas() {
  const { villas, addVilla, updateVilla } = useData();
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [isAddingVilla, setIsAddingVilla] = useState(false);
  const [formData, setFormData] = useState<Partial<Villa>>({});
  

  const handleEdit = (villa: Villa) => {
    setEditingVilla(villa);
    setIsAddingVilla(false);
    setFormData({
      location: villa.location,
      maxGuests: villa.maxGuests,
      pricePerNight: villa.pricePerNight,
      status: villa.status,
    });
  };

  const handleAddNew = () => {
    setIsAddingVilla(true);
    setEditingVilla(null);
    setFormData({
      name: '',
      location: '',
      maxGuests: 4,
      pricePerNight: 5000,
      status: 'active',
    });
  };

  const handleSave = async () => {
    if (isAddingVilla) {
      // Adding new villa
      if (!formData.name || !formData.location || !formData.maxGuests || !formData.pricePerNight) {
        toast.error('Please fill in all required fields');
        return;
      }

      const result = await addVilla({
        name: formData.name,
        location: formData.location,
        maxGuests: formData.maxGuests,
        pricePerNight: formData.pricePerNight,
        status: formData.status || 'active',
      });

      if (result) {
        toast.success('Villa added successfully');
        setIsAddingVilla(false);
        setFormData({});
      }
    } else if (editingVilla) {
      // Updating existing villa
      await updateVilla(editingVilla.id, formData);
      setEditingVilla(null);
      setFormData({});

      toast.success('Villa updated successfully');
    }
  };

  const toggleMaintenance = (villa: Villa) => {
    const newStatus = villa.status === 'active' ? 'maintenance' : 'active';
    updateVilla(villa.id, { status: newStatus });

    toast.success(`${villa.name} is now ${newStatus === 'active' ? 'active' : 'under maintenance'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Villa Management</h1>
          <p className="text-muted-foreground">Manage your {villas.length} villas</p>
        </div>
        <Button onClick={handleAddNew}>
          Add Villa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {villas.map((villa) => (
          <Card key={villa.id} className="relative overflow-hidden">
            {villa.status === 'maintenance' && (
              <div className="absolute top-0 right-0 left-0 h-1 bg-maintenance" />
            )}
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{villa.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{villa.location}</p>
                </div>
              </div>
              <Badge
                variant={villa.status === 'active' ? 'default' : 'secondary'}
                className={villa.status === 'maintenance' ? 'bg-maintenance text-primary-foreground' : ''}
              >
                {villa.status === 'active' ? 'Active' : 'Maintenance'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">{villa.maxGuests}</span> guests max
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">₹{villa.pricePerNight.toLocaleString()}</span>/night
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(villa)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={villa.status === 'active' ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => toggleMaintenance(villa)}
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  {villa.status === 'active' ? 'Set Maintenance' : 'Set Active'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingVilla || isAddingVilla} onOpenChange={(open) => {
        if (!open) {
          setEditingVilla(null);
          setIsAddingVilla(false);
          setFormData({});
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddingVilla ? 'Add New Villa' : 'Edit Villa'}</DialogTitle>
            <DialogDescription>
              {isAddingVilla ? 'Create a new villa property' : `Update details for ${editingVilla?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isAddingVilla && (
              <div className="space-y-2">
                <Label htmlFor="name">Villa Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., SOLE VILLA"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="location">Location {isAddingVilla && '*'}</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Beachfront"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests {isAddingVilla && '*'}</Label>
              <Input
                id="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests || ''}
                onChange={(e) => setFormData({ ...formData, maxGuests: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price per Night (₹) {isAddingVilla && '*'}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.pricePerNight || ''}
                onChange={(e) => setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value: 'active' | 'maintenance') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingVilla(null);
              setIsAddingVilla(false);
              setFormData({});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{isAddingVilla ? 'Add Villa' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
