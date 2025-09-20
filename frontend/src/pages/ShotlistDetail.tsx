import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import type { Shotlist, ShotlistItem } from '../types';
import { shotlistsService } from '../services/shotlists.service';
import { shotlistItemsService } from '../services/shotlist-items.service';
import { ShotlistItemCard } from '../components/shotlist-items/ShotlistItemCard';
import { ShotlistItemForm } from '../components/shotlist-items/ShotlistItemForm';
import { formatDuration, calculateTotalDuration, recalculateStartTimes } from '../utils/timeCalculations';

export const ShotlistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shotlist, setShotlist] = useState<Shotlist | null>(null);
  const [items, setItems] = useState<ShotlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItemForm, setShowNewItemForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      fetchShotlistDetails();
    }
  }, [id]);

  const fetchShotlistDetails = async () => {
    try {
      const [shotlistData, itemsData] = await Promise.all([
        shotlistsService.getShotlist(id!),
        shotlistItemsService.getShotlistItems(id!)
      ]);
      setShotlist(shotlistData);
      setItems(itemsData.sort((a, b) => a.order_index - b.order_index));
    } catch (error) {
      console.error('Failed to fetch shotlist details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);

    // Update order_index for all items
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // Recalculate start times if call time is set
    if (shotlist?.call_time) {
      const itemsWithTimes = recalculateStartTimes(updatedItems, shotlist.call_time);
      setItems(itemsWithTimes as ShotlistItem[]);
    } else {
      setItems(updatedItems);
    }

    // Send reorder request to backend
    try {
      const itemIds = updatedItems.map(item => item.id);
      await shotlistItemsService.reorderItems(id!, itemIds);
    } catch (error) {
      console.error('Failed to reorder items:', error);
      // Revert on error
      fetchShotlistDetails();
    }
  };

  const handleAddItem = async (newItem: Partial<ShotlistItem>) => {
    try {
      const createdItem = await shotlistItemsService.createItem(id!, {
        ...newItem,
        order_index: items.length
      });

      const updatedItems = [...items, createdItem];
      if (shotlist?.call_time) {
        const itemsWithTimes = recalculateStartTimes(updatedItems, shotlist.call_time);
        setItems(itemsWithTimes as ShotlistItem[]);
      } else {
        setItems(updatedItems);
      }

      setShowNewItemForm(false);
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<ShotlistItem>) => {
    try {
      const updatedItem = await shotlistItemsService.updateItem(itemId, updates);

      const updatedItems = items.map(item =>
        item.id === itemId ? updatedItem : item
      );

      // Recalculate times if duration changed
      if (shotlist?.call_time && updates.shot_duration !== undefined) {
        const itemsWithTimes = recalculateStartTimes(updatedItems, shotlist.call_time);
        setItems(itemsWithTimes as ShotlistItem[]);
      } else {
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await shotlistItemsService.deleteItem(itemId);
      const updatedItems = items.filter(item => item.id !== itemId);

      if (shotlist?.call_time) {
        const itemsWithTimes = recalculateStartTimes(updatedItems, shotlist.call_time);
        setItems(itemsWithTimes as ShotlistItem[]);
      } else {
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading shotlist...</div>;
  }

  if (!shotlist) {
    return <div className="text-center py-8">Shotlist not found</div>;
  }

  const totalDuration = calculateTotalDuration(items);

  return (
    <div className="px-4 sm:px-0 max-w-6xl mx-auto">
      {/* Shotlist Header */}
      <div className="mb-8">
        <Link to={`/projects/${shotlist.project_id}`} className="text-primary-600 hover:text-primary-500 mb-4 inline-block">
          ← Back to Project
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{shotlist.name}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {shotlist.shooting_date && (
              <div>
                <span className="font-medium text-gray-700">Shooting Date:</span>{' '}
                {new Date(shotlist.shooting_date).toLocaleDateString()}
              </div>
            )}
            {shotlist.call_time && (
              <div>
                <span className="font-medium text-gray-700">Call Time:</span>{' '}
                {shotlist.call_time}
              </div>
            )}
            {shotlist.wrap_time && (
              <div>
                <span className="font-medium text-gray-700">Wrap Time:</span>{' '}
                {shotlist.wrap_time}
              </div>
            )}
            {shotlist.location && (
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Location:</span>{' '}
                {shotlist.location}
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Total Duration:</span>{' '}
              {formatDuration(totalDuration)}
            </div>
          </div>

          {shotlist.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="text-gray-600">{shotlist.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Shotlist Items */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Shot List Items</h2>
          <button
            onClick={() => setShowNewItemForm(true)}
            className="btn-primary"
          >
            Add Shot
          </button>
        </div>

        {/* New Item Form */}
        {showNewItemForm && (
          <div className="mb-6">
            <ShotlistItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowNewItemForm(false)}
            />
          </div>
        )}

        {/* Items List */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-900">No shots yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add your first shot to start building your shot list.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {items.map((item) => (
                  <ShotlistItemCard
                    key={item.id}
                    item={item}
                    onUpdate={handleUpdateItem}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};