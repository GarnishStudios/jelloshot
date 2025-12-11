import React, { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  Plus,
  Upload,
  Lock,
  Unlock,
} from "lucide-react";
import {
  calculateEndTime,
  formatTimeTo12Hour,
} from "../../utils/timeCalculations";
import { InlineEdit } from "../ui/InlineEdit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getCallSheetAPI } from "@/type-gen/api";
import type { ShotlistItem } from "@/type-gen/api";

interface ShotlistItemCardProps {
  item: ShotlistItem;
  onUpdate: (id: string, updates: Partial<ShotlistItem>) => void;
  onDelete: (id: string) => void;
  onDurationChange?: (id: string, newDuration: number) => void;
  onAddPropertyToAll?: (propertyKey: string) => void;
  index?: number;
}

// Modern gradient colors for shot numbers
const getGradientForIndex = (index: number) => {
  const gradients = [
    "bg-gradient-to-br from-blue-500 to-blue-600", // Blue
    "bg-gradient-to-br from-purple-500 to-purple-600", // Purple
    "bg-gradient-to-br from-pink-500 to-pink-600", // Pink
    "bg-gradient-to-br from-orange-500 to-orange-600", // Orange
    "bg-gradient-to-br from-teal-500 to-teal-600", // Teal
    "bg-gradient-to-br from-indigo-500 to-indigo-600", // Indigo
    "bg-gradient-to-br from-red-500 to-red-600", // Red
    "bg-gradient-to-br from-cyan-500 to-cyan-600", // Cyan
    "bg-gradient-to-br from-emerald-500 to-emerald-600", // Emerald
    "bg-gradient-to-br from-violet-500 to-violet-600", // Violet
    "bg-gradient-to-br from-amber-500 to-amber-600", // Amber
    "bg-gradient-to-br from-rose-500 to-rose-600", // Rose
  ];

  return gradients[(index - 1) % gradients.length];
};

export const ShotlistItemCard: React.FC<ShotlistItemCardProps> = ({
  item,
  onUpdate,
  onDelete,
  onDurationChange,
  onAddPropertyToAll,
  index = 1,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [newPropertyKey, setNewPropertyKey] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: response } =
        await getCallSheetAPI().uploadImageApiShotlistItemsItemIdUploadImagePost(
          item.id,
          { file },
        );
      onUpdate(item.id, { shot_reference_image: response.url });
    } catch (error) {
      console.error("Failed to upload image:", error);
      console.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddProperty = () => {
    if (newPropertyKey.trim()) {
      const propertyKey = newPropertyKey.trim();

      // Add property to current item
      const currentProperties = item.custom_properties || {};
      const updatedProperties = {
        ...currentProperties,
        [propertyKey]: "",
      };
      onUpdate(item.id, { custom_properties: updatedProperties });

      // Add property to all other shots if callback is provided
      if (onAddPropertyToAll) {
        onAddPropertyToAll(propertyKey);
      }

      setNewPropertyKey("");
      setShowAddProperty(false);
    }
  };

  const handleUpdateProperty = (key: string, value: string) => {
    const currentProperties = item.custom_properties || {};
    const updatedProperties = {
      ...currentProperties,
      [key]: value,
    };
    onUpdate(item.id, { custom_properties: updatedProperties });
  };

  const handleDeleteProperty = (key: string) => {
    const currentProperties = item.custom_properties || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...updatedProperties } = currentProperties;
    onUpdate(item.id, { custom_properties: updatedProperties });
  };

  const handleCompleteToggle = (checked: boolean) => {
    setIsAnimating(true);
    onUpdate(item.id, { is_completed: checked });

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  const isLunchBreak = item.shot_type === "Lunch";

  // Get shot icon based on shot name or type
  const getShotIcon = () => {
    const name = item.shot_name.toLowerCase();
    if (name.includes("close") || name.includes("product")) return "👁️";
    if (name.includes("hero") || name.includes("opening")) return "⭐";
    if (name.includes("wide")) return "📷";
    if (isLunchBreak) return "🍽️";
    return "🎬";
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 backdrop-blur-xl relative overflow-hidden border",
        "bg-gradient-to-br from-slate-800/40 via-slate-800/60 to-slate-900/70 border-white/10",
        "shadow-lg shadow-black/25 hover:border-white/20",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none",
        isLunchBreak &&
          "border-green-400/30 bg-gradient-to-br from-green-900/40 via-green-800/50 to-green-900/60",
        isDragging && "rotate-2 scale-105 shadow-2xl shadow-black/40",
        item.is_completed &&
          "bg-gradient-to-br from-green-500/30 via-green-400/40 to-green-500/50 border-green-400/40",
        isAnimating && "completion-celebration",
      )}
    >
      {/* Strike-through overlay when completed */}
      {item.is_completed && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-green-400 transform -translate-y-1/2 shadow-lg strike-through-line"></div>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-300 transform -translate-y-1/2 blur-sm"></div>
        </div>
      )}

      <CardContent
        className={cn(
          "p-4 transition-all duration-300",
          item.is_completed && "opacity-70",
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          {/* Left: Badge with number and drag handle */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-move"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Badge
                variant="outline"
                className={cn(
                  "w-8 h-8 rounded-full p-0 flex items-center justify-center font-semibold border-0 shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl text-white tracking-tight",
                  "font-sans antialiased",
                  isLunchBreak
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : getGradientForIndex(index),
                )}
              >
                {isLunchBreak ? "🍽️" : index}
              </Badge>
            </div>

            {/* Shot name and icon */}
            <div className="flex items-center gap-2">
              <span className="text-lg">{getShotIcon()}</span>
              <InlineEdit
                value={item.shot_name}
                onSave={(value) => onUpdate(item.id, { shot_name: value })}
                placeholder="Click to edit shot name"
                className="font-medium bg-transparent border-none p-1 hover:bg-accent rounded cursor-text min-w-[120px]"
              />
            </div>
          </div>

          {/* Center: Time info */}
          <div className="flex items-center gap-2 text-sm text-slate-200 font-medium bg-black/20 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-lg tracking-tight shadow-inner">
            <span>
              {item.start_time ? formatTimeTo12Hour(item.start_time) : "--:--"}
            </span>
            <span>•</span>
            <InlineEdit
              value={item.shot_duration.toString()}
              onSave={(value) => {
                const newDuration = parseInt(value) || 10;
                if (onDurationChange) {
                  onDurationChange(item.id, newDuration);
                } else {
                  onUpdate(item.id, { shot_duration: newDuration });
                }
              }}
              placeholder="10"
              type="number"
              className="bg-transparent border-none p-0 hover:bg-accent rounded cursor-text min-w-[20px] text-center font-medium text-sm text-slate-200 tracking-tight"
              suffix="min"
            />
            <span>→</span>
            <span>
              {item.start_time
                ? formatTimeTo12Hour(
                    calculateEndTime(item.start_time, item.shot_duration),
                  )
                : "--:--"}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Duration Lock Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                item.duration_locked
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(item.id, { duration_locked: !item.duration_locked });
              }}
              title={
                item.duration_locked ? "Duration locked" : "Duration flexible"
              }
            >
              {item.duration_locked ? (
                <Lock className="h-4 w-4" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>

            {/* Mark Complete Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.is_completed || false}
                onChange={(e) => {
                  e.stopPropagation();
                  handleCompleteToggle(e.target.checked);
                }}
                className="w-5 h-5 text-green-500 bg-transparent border-2 border-border rounded focus:ring-green-500 focus:ring-2 transition-all duration-200 hover:border-green-400 checked:bg-green-500 checked:border-green-500"
                title="Mark as complete"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  confirm(
                    isLunchBreak
                      ? "Delete this lunch break?"
                      : "Delete this shot?",
                  )
                ) {
                  onDelete(item.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-600/50 pt-6 mt-4 space-y-6 bg-gradient-to-br from-slate-900/60 via-slate-800/70 to-indigo-900/30 -mx-4 px-6 pb-4 rounded-b-lg backdrop-blur-sm">
            {/* Mark Complete Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.is_completed || false}
                  onChange={(e) =>
                    onUpdate(item.id, { is_completed: e.target.checked })
                  }
                  className="w-4 h-4 accent-primary"
                />
                <span className="font-medium text-sm text-slate-200">
                  Mark Complete
                </span>
              </div>
            </div>

            {isLunchBreak ? (
              /* Lunch Break Specific Content */
              <>
                {/* Duration Setting */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Lunch Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={item.shot_duration || 60}
                    onChange={(e) => {
                      const newDuration = parseInt(e.target.value) || 60;
                      if (onDurationChange) {
                        onDurationChange(item.id, newDuration);
                      } else {
                        onUpdate(item.id, { shot_duration: newDuration });
                      }
                    }}
                    placeholder="60"
                    min="15"
                    max="180"
                    className="w-full"
                  />
                </div>

                {/* Restaurant Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Restaurant Name
                    </label>
                    <Input
                      value={
                        (item.custom_properties?.restaurant_name as string) ||
                        ""
                      }
                      onChange={(e) =>
                        handleUpdateProperty("restaurant_name", e.target.value)
                      }
                      placeholder="e.g., Joe's Pizza, The Local Diner"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Address/Location
                    </label>
                    <Input
                      value={(item.custom_properties?.location as string) || ""}
                      onChange={(e) =>
                        handleUpdateProperty("location", e.target.value)
                      }
                      placeholder="e.g., 123 Main St, Downtown"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Phone Number
                    </label>
                    <Input
                      value={(item.custom_properties?.phone as string) || ""}
                      onChange={(e) =>
                        handleUpdateProperty("phone", e.target.value)
                      }
                      placeholder="e.g., (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Dietary Requirements
                    </label>
                    <Input
                      value={
                        (item.custom_properties
                          ?.dietary_requirements as string) || ""
                      }
                      onChange={(e) =>
                        handleUpdateProperty(
                          "dietary_requirements",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Vegetarian options, Gluten-free"
                    />
                  </div>
                </div>

                {/* Notes for Lunch */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Notes
                  </label>
                  <Textarea
                    value={item.shot_description || ""}
                    onChange={(e) =>
                      onUpdate(item.id, { shot_description: e.target.value })
                    }
                    rows={3}
                    placeholder="Special instructions, group size, reservation details, etc."
                  />
                </div>
              </>
            ) : (
              /* Regular Shot Content */
              <>
                {/* Camera Settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={item.shot_duration || 10}
                      onChange={(e) => {
                        const newDuration = parseInt(e.target.value) || 10;
                        if (onDurationChange) {
                          onDurationChange(item.id, newDuration);
                        } else {
                          onUpdate(item.id, { shot_duration: newDuration });
                        }
                      }}
                      placeholder="10"
                      min="1"
                      max="480"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Camera Angle
                    </label>
                    <Input
                      value={item.camera_angle || "Overhead"}
                      onChange={(e) =>
                        onUpdate(item.id, { camera_angle: e.target.value })
                      }
                      placeholder="Overhead"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Aspect Ratio
                    </label>
                    <select
                      value={item.aspect_ratio || "16:9"}
                      onChange={(e) =>
                        onUpdate(item.id, { aspect_ratio: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-800/70 border border-slate-600/50 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50"
                    >
                      <option value="16:9">16:9</option>
                      <option value="4:3">4:3</option>
                      <option value="21:9">21:9</option>
                      <option value="1:1">1:1</option>
                      <option value="9:16">9:16</option>
                      <option value="2.39:1">2.39:1 (Cinemascope)</option>
                      <option value="1.85:1">1.85:1</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      FPS
                    </label>
                    <Input
                      type="number"
                      value={item.fps || 24}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          fps: parseInt(e.target.value) || 24,
                        })
                      }
                      placeholder="24"
                    />
                  </div>
                </div>

                {/* Shot Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Shot Description
                  </label>
                  <Textarea
                    value={item.shot_description || ""}
                    onChange={(e) =>
                      onUpdate(item.id, { shot_description: e.target.value })
                    }
                    rows={3}
                    placeholder="Wide shot capturing the studio setup with brand logo in the background. Ensure smooth dolly movement. @cinematographer, @grip"
                  />
                </div>

                {/* Reference Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">
                    Reference Image
                  </label>
                  {item.shot_reference_image ? (
                    <div className="space-y-3">
                      <div className="relative w-full max-w-[300px] border border-border rounded-lg overflow-hidden bg-card">
                        <img
                          src={`http://localhost:8000${item.shot_reference_image}`}
                          alt="Reference"
                          className="w-full h-auto object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%2364748b">Image not found</text></svg>';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full justify-center gap-2"
                        disabled={uploadingImage}
                        size="sm"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingImage ? "Uploading..." : "Replace"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full justify-center gap-2"
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4" />
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </>
            )}

            {/* Custom Properties (for both types) */}
            {!isLunchBreak &&
              item.custom_properties &&
              Object.keys(item.custom_properties).length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-200">
                    Custom Properties
                  </label>
                  <div className="space-y-3">
                    {Object.entries(item.custom_properties).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <label className="text-xs text-muted-foreground capitalize">
                              {key}
                            </label>
                            <Input
                              value={value as string}
                              onChange={(e) =>
                                handleUpdateProperty(key, e.target.value)
                              }
                              placeholder={`Enter ${key}...`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProperty(key)}
                            className="h-10 w-10 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Add Property Section (only for regular shots) */}
            {!isLunchBreak && (
              <div>
                {!showAddProperty ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddProperty(true)}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Add a property
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newPropertyKey}
                      onChange={(e) => setNewPropertyKey(e.target.value)}
                      placeholder="Property name (e.g., background, lighting)"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddProperty();
                        } else if (e.key === "Escape") {
                          setShowAddProperty(false);
                          setNewPropertyKey("");
                        }
                      }}
                      autoFocus
                    />
                    <Button type="button" onClick={handleAddProperty} size="sm">
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddProperty(false);
                        setNewPropertyKey("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
