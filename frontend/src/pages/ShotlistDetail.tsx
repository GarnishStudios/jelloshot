import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, Camera, Users, MessageSquare, Bell, FileText } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import type { Shotlist, ShotlistItem, CrewMember, ClientMember, Project } from '../types';
import { shotlistItemsService } from '../services/shotlist-items.service';
import { shotlistsService } from '../services/shotlists.service';
import { projectsService } from '../services/projects.service';
import { crewService } from '../services/crew.service';
import { formatDuration, recalculateStartTimes, recalculateStartTimesWithBoundaries, recalculateWithShotBelowDistribution, formatTimeTo12Hour } from '../utils/timeCalculations';
import { ShotlistItemCard } from '../components/shotlist-items/ShotlistItemCard';
import { ProjectDetailsSection } from '../components/project/ProjectDetailsSection';
import { CrewSection } from '../components/project/CrewSection';
import { ClientSection } from '../components/project/ClientSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const ShotlistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();


  if (!id) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="text-destructive">Error: No project ID provided</div>
      </div>
    );
  }

  const [shotlist, setShotlist] = useState<Shotlist | null>(null);
  const [shotlistItems, setShotlistItems] = useState<ShotlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [clientMembers, setClientMembers] = useState<ClientMember[]>([]);
  const [lastManuallyChangedItem, setLastManuallyChangedItem] = useState<{ itemId: string; duration: number } | null>(null);

  const handleProjectUpdate = (updates: Partial<Project>) => {
    if (project) {
      setProject({ ...project, ...updates });
    }
  };

  const handleAddCrewMember = (memberData: Partial<CrewMember>) => {
    // Create a temporary crew member with local ID since backend doesn't exist yet
    const newMember: CrewMember = {
      id: Date.now().toString(), // Temporary ID
      project_id: project?.id || '',
      name: memberData.name || '',
      role: memberData.role || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      call_time: memberData.call_time || '',
      allergies: memberData.allergies || '',
      notes: memberData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setCrewMembers([...crewMembers, newMember]);
  };

  const handleUpdateCrewMember = (id: string, updates: Partial<CrewMember>) => {
    setCrewMembers(crewMembers.map(member =>
      member.id === id ? { ...member, ...updates, updated_at: new Date().toISOString() } : member
    ));
  };

  const handleDeleteCrewMember = (id: string) => {
    setCrewMembers(crewMembers.filter(member => member.id !== id));
  };

  const handleAddClientMember = (memberData: Partial<ClientMember>) => {
    // Create a temporary client member with local ID since backend doesn't exist yet
    const newMember: ClientMember = {
      id: Date.now().toString(), // Temporary ID
      project_id: project?.id || '',
      name: memberData.name || '',
      company: memberData.company || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      call_time: memberData.call_time || '',
      allergies: memberData.allergies || '',
      notes: memberData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setClientMembers([...clientMembers, newMember]);
  };

  const handleUpdateClientMember = (id: string, updates: Partial<ClientMember>) => {
    setClientMembers(clientMembers.map(member =>
      member.id === id ? { ...member, ...updates, updated_at: new Date().toISOString() } : member
    ));
  };

  const handleDeleteClientMember = (id: string) => {
    setClientMembers(clientMembers.filter(member => member.id !== id));
  };


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Get project shotlists to find the right shotlist
      const shotlists = await shotlistsService.getProjectShotlists(id);
      let currentShotlist = shotlists[0]; // Try to get the first shotlist

      // If no shotlist exists, create a default one
      if (!currentShotlist) {
        currentShotlist = await shotlistsService.createShotlist(id, {
          name: 'Main Shotlist',
          notes: 'Primary shot list for this project'
        });
      }

      setShotlist(currentShotlist);

      // Load shotlist items
      const items = await shotlistItemsService.getShotlistItems(currentShotlist.id);
      setShotlistItems(items);

      // Load project details
      const projectData = await projectsService.getProject(id);
      setProject(projectData);

      // Load crew members (optional - backend might not have this endpoint yet)
      try {
        const crew = await crewService.getProjectCrew(id);
        setCrewMembers(crew);
      } catch (crewError) {
        console.warn('Crew endpoint not available yet:', crewError);
        setCrewMembers([]); // Set empty array if crew endpoint doesn't exist
      }

    } catch (err: any) {
      console.error('Failed to load shotlist data:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load shotlist data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recalculate start times when items change
  const calculatedItems = useMemo(() => {
    if (shotlistItems.length === 0) return shotlistItems;

    // Use project start_time and end_time if available, otherwise fall back to shotlist times
    const startTime = project?.start_time || shotlist?.call_time;
    const endTime = project?.end_time || shotlist?.wrap_time;

    if (!startTime) return shotlistItems;

    if (endTime) {
      // If there was a manual duration change, use the shots below distribution logic
      if (lastManuallyChangedItem) {
        return recalculateWithShotBelowDistribution(
          shotlistItems,
          lastManuallyChangedItem.itemId,
          lastManuallyChangedItem.duration,
          startTime,
          endTime
        );
      } else {
        return recalculateStartTimesWithBoundaries(
          shotlistItems,
          startTime,
          endTime
        );
      }
    } else {
      return recalculateStartTimes(shotlistItems, startTime);
    }
  }, [shotlistItems, project?.start_time, project?.end_time, shotlist?.call_time, shotlist?.wrap_time, lastManuallyChangedItem]);

  // Automatically update backend when durations are redistributed due to manual changes
  useEffect(() => {
    if (lastManuallyChangedItem && calculatedItems.length > 0) {
      const currentItems = shotlistItems;
      const calculatedItemsMap = new Map(calculatedItems.map(item => [item.id, item]));

      // Check if any durations actually changed (to avoid infinite loops)
      const durationsChanged = currentItems.some(item => {
        const calculatedItem = calculatedItemsMap.get(item.id);
        return calculatedItem && calculatedItem.shot_duration !== item.shot_duration;
      });

      if (durationsChanged) {
        // Clear the manual change tracking to avoid re-triggering
        setLastManuallyChangedItem(null);
        // Update the backend with redistributed durations
        handleBulkDurationUpdate(calculatedItems);
      }
    }
  }, [calculatedItems, lastManuallyChangedItem]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && shotlist) {
      const oldIndex = shotlistItems.findIndex(item => item.id === active.id);
      const newIndex = shotlistItems.findIndex(item => item.id === over.id);

      const newItems = arrayMove(shotlistItems, oldIndex, newIndex);
      setShotlistItems(newItems);

      try {
        const reorderedItems = await shotlistItemsService.reorderItems(
          shotlist.id,
          newItems.map(item => item.id)
        );
        setShotlistItems(reorderedItems);
      } catch (error) {
        console.error('Failed to reorder items:', error);
        setShotlistItems(shotlistItems); // Revert on error
      }
    }
  };

  const handleAddItem = async () => {
    if (!shotlist) {
      alert('No shotlist found');
      return;
    }

    try {
      const newItem = await shotlistItemsService.createItem(shotlist.id, {
        shot_name: `Shot ${shotlistItems.length + 1}`,
        shot_duration: 10,
        order_index: shotlistItems.length
      });

      setShotlistItems([...shotlistItems, newItem]);
    } catch (error) {
      console.error('Failed to create item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetail = (error as any)?.response?.data?.detail;
      alert('Failed to create shot item: ' + (errorDetail || errorMessage));
    }
  };

  const handleAddLunchBreak = async () => {
    if (!shotlist) return;

    try {
      const newItem = await shotlistItemsService.createItem(shotlist.id, {
        shot_name: 'Lunch Break',
        shot_type: 'Lunch',
        shot_duration: 60, // Default 1 hour lunch break
        order_index: shotlistItems.length
      });
      setShotlistItems([...shotlistItems, newItem]);
    } catch (error) {
      console.error('Failed to create lunch break:', error);
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<ShotlistItem>) => {
    try {
      // Check if this is a manual duration change (but not just a lock toggle)
      const isJustLockToggle = Object.keys(updates).length === 1 && updates.hasOwnProperty('duration_locked');

      if (updates.shot_duration !== undefined && !isJustLockToggle) {
        setLastManuallyChangedItem({ itemId: id, duration: updates.shot_duration });
      }

      const updatedItem = await shotlistItemsService.updateItem(id, updates);
      setShotlistItems(items =>
        items.map(item => item.id === id ? updatedItem : item)
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  // Special handler for duration changes that triggers time recalculation
  const handleDurationChange = async (id: string, newDuration: number) => {
    try {
      // Set the manual duration change flag immediately
      setLastManuallyChangedItem({ itemId: id, duration: newDuration });

      // Update the local state immediately for UI responsiveness
      // Also automatically lock the duration when manually edited
      setShotlistItems(items =>
        items.map(item =>
          item.id === id
            ? { ...item, shot_duration: newDuration, duration_locked: true }
            : item
        )
      );

      // Update the backend with both duration and lock status
      await shotlistItemsService.updateItem(id, {
        shot_duration: newDuration,
        duration_locked: true
      });
    } catch (error) {
      console.error('Failed to update duration:', error);
      // Revert local state on error
      loadData();
    }
  };

  // Update all shot durations when redistribution happens
  const handleBulkDurationUpdate = async (itemsWithNewDurations: typeof shotlistItems) => {
    try {
      // Update each item's duration in the backend
      const updatePromises = itemsWithNewDurations.map(item =>
        shotlistItemsService.updateItem(item.id, { shot_duration: item.shot_duration })
      );

      await Promise.all(updatePromises);

      // Update local state with all the new durations
      setShotlistItems(itemsWithNewDurations);
    } catch (error) {
      console.error('Failed to update shot durations:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await shotlistItemsService.deleteItem(id);
      setShotlistItems(items => items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleAddPropertyToAll = async (propertyKey: string) => {
    try {
      // Get all shots that don't already have this property
      const shotsToUpdate = shotlistItems.filter(item =>
        item.shot_type !== 'Lunch' && // Skip lunch breaks
        (!item.custom_properties || !item.custom_properties.hasOwnProperty(propertyKey))
      );

      // Update each shot that doesn't have the property
      const updatePromises = shotsToUpdate.map(item => {
        const currentProperties = item.custom_properties || {};
        const updatedProperties = {
          ...currentProperties,
          [propertyKey]: ''
        };
        return shotlistItemsService.updateItem(item.id, { custom_properties: updatedProperties });
      });

      await Promise.all(updatePromises);

      // Update local state
      setShotlistItems(items =>
        items.map(item => {
          if (item.shot_type === 'Lunch' || (item.custom_properties && item.custom_properties.hasOwnProperty(propertyKey))) {
            return item; // Skip lunch breaks and items that already have the property
          }
          const currentProperties = item.custom_properties || {};
          return {
            ...item,
            custom_properties: {
              ...currentProperties,
              [propertyKey]: ''
            }
          };
        })
      );
    } catch (error) {
      console.error('Failed to add property to all shots:', error);
    }
  };

  const handleTimeChange = () => {
    // Force recalculation when project times change
    // The useMemo will automatically recalculate with the new project times
  };

  const totalDuration = shotlistItems.reduce((total, item) => total + item.shot_duration, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading shotlist...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/clients">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to clients
            </Link>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription>Project ID: {id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">{error}</p>
              {error.includes('Not authenticated') && (
                <Button asChild>
                  <Link to="/login">Please Login</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 scrollbar-styled relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-indigo-500/5 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
      <div className="relative z-10">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <Button variant="ghost" size="sm" asChild className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <Link to="/clients">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clients
                  </Link>
                </Button>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                    {project?.name || 'Project'}
                  </h1>
                  <p className="text-slate-400 font-medium">Shot List Management</p>
                </div>
                {shotlist && (
                  <div className="flex items-center gap-4 pt-2">
                    {shotlist.call_time && (
                      <Badge className="gap-1 bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30 transition-colors">
                        <Clock className="h-3 w-3" />
                        Call: {formatTimeTo12Hour(shotlist.call_time)}
                      </Badge>
                    )}
                    {shotlist.wrap_time && (
                      <Badge className="gap-1 bg-purple-500/20 text-purple-300 border-purple-400/30 hover:bg-purple-500/30 transition-colors">
                        <Camera className="h-3 w-3" />
                        Wrap: {formatTimeTo12Hour(shotlist.wrap_time)}
                      </Badge>
                    )}
                    <Badge className="gap-1 bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30 transition-colors">
                      <FileText className="h-3 w-3" />
                      {shotlistItems.length} shots • {formatDuration(totalDuration)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Shot
              </Button>
              <Button onClick={handleAddLunchBreak} variant="secondary" className="gap-2">
                🍽️ Lunch Break
              </Button>
            </div>
          </div>

          {/* Project Details Section */}
          {project && (
            <ProjectDetailsSection
              project={project}
              onUpdate={handleProjectUpdate}
              onTimeChange={handleTimeChange}
            />
          )}

          {/* Crew Section */}
          <CrewSection
            crewMembers={crewMembers}
            onAddMember={handleAddCrewMember}
            onUpdateMember={handleUpdateCrewMember}
            onDeleteMember={handleDeleteCrewMember}
          />

          {/* Client Section */}
          <ClientSection
            clientMembers={clientMembers}
            onAddMember={handleAddClientMember}
            onUpdateMember={handleUpdateClientMember}
            onDeleteMember={handleDeleteClientMember}
          />

          {/* Main Layout - Split into left shot list and right sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shot List Section - Left 2/3 */}
            <div className="lg:col-span-2">
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20">
                {/* Header */}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-200 font-semibold">Shot List</CardTitle>
                      <CardDescription className="text-slate-400">
                        {shotlistItems.length} shots • {project?.start_time && project?.end_time ?
                          `${formatTimeTo12Hour(project.start_time)} - ${formatTimeTo12Hour(project.end_time)}` :
                          formatDuration(totalDuration)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddItem} className="gap-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                        <Plus className="h-3 w-3" />
                        Add Shot
                      </Button>
                      <Button size="sm" onClick={handleAddLunchBreak} className="gap-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                        🍽️ Lunch
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Progress Bar */}
                <div className="px-6 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{calculatedItems.filter(item => item.is_completed).length} completed</span>
                      <span>
                        {calculatedItems.length > 0 && calculatedItems.filter(item => item.is_completed).length === calculatedItems.length
                          ? "🍸 Martini Shot! 🎬"
                          : "Shot Progress"
                        }
                      </span>
                      <span>{calculatedItems.length} total</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${calculatedItems.length > 0 ? (calculatedItems.filter(item => item.is_completed).length / calculatedItems.length) * 100 : 0}%`
                        }}
                      >
                        {/* Effect at the end of progress */}
                        {calculatedItems.filter(item => item.is_completed).length > 0 && (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                            {calculatedItems.length > 0 && calculatedItems.filter(item => item.is_completed).length === calculatedItems.length ? (
                              // Martini glass for 100% completion (Martini Shot!)
                              <div className="relative">
                                <div className="text-xl animate-bounce" style={{ animationDuration: '1s' }}>
                                  🍸
                                </div>
                                {/* Sparkle effect around the martini */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-yellow-400 text-xs animate-ping">
                                  ✨
                                </div>
                              </div>
                            ) : (
                              // Regular sparkle for partial completion
                              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50">
                                <div className="absolute inset-0 bg-emerald-300 rounded-full animate-ping"></div>
                                <div className="absolute inset-1 bg-white rounded-full opacity-60"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <CardContent className="space-y-4">
                  {calculatedItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">No shots added yet</h3>
                          <p className="text-sm text-muted-foreground">Create your first shot to get started</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleAddItem} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Your First Shot
                          </Button>
                          <Button onClick={handleAddLunchBreak} variant="outline" className="gap-2">
                            🍽️ Add Lunch Break
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={calculatedItems.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {calculatedItems.map((item, index) => (
                            <ShotlistItemCard
                              key={item.id}
                              item={item}
                              onUpdate={handleUpdateItem}
                              onDelete={handleDeleteItem}
                              onDurationChange={handleDurationChange}
                              onAddPropertyToAll={handleAddPropertyToAll}
                              index={index + 1}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - 1/3 */}
            <div className="space-y-6">
              {/* Shot Preview */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-200 font-semibold">Shot Preview</CardTitle>
                  <CardDescription className="text-slate-400">All {calculatedItems.length} shots</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {calculatedItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No shots to preview</p>
                  ) : (
                    <div className="max-h-96 overflow-y-auto px-6 pb-6">
                      <div className="space-y-3">
                        {calculatedItems.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 transition-colors">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">{item.shot_name}</p>
                              <p className="text-xs text-slate-400">
                                {item.start_time ? formatTimeTo12Hour(item.start_time) : '--:--'} • {item.shot_duration}min
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "w-2 h-2 p-0 rounded-full",
                                index === 0 && "bg-emerald-500",
                                index === 1 && "bg-blue-500",
                                index === 2 && "bg-purple-500",
                                index === 3 && "bg-orange-500",
                                index >= 4 && "bg-slate-500"
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Crew & Communication */}
              <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-200 font-semibold">Team & Communication</CardTitle>
                  <CardDescription className="text-slate-400">Coordinate with your production team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send SMS Updates
                  </Button>
                  <Button className="btn-ghost w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Manage Crew
                  </Button>
                  <Button className="btn-ghost w-full justify-start gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};