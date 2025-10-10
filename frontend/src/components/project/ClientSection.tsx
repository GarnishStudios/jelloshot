import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { ClientMember } from '../../types';
import { InlineEdit } from '../ui/InlineEdit';
import { TimeInput12Hour } from '../ui/TimeInput12Hour';
import { Button } from '../ui/button';

interface ClientSectionProps {
  clientMembers: ClientMember[];
  onAddMember: (member: Partial<ClientMember>) => void;
  onUpdateMember: (id: string, updates: Partial<ClientMember>) => void;
  onDeleteMember: (id: string) => void;
}

export const ClientSection: React.FC<ClientSectionProps> = ({
  clientMembers,
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddMember = () => {
    onAddMember({
      name: '',
      company: '',
      email: '',
      call_time: '',
      allergies: ''
    });
  };

  const handleFieldUpdate = (id: string, field: keyof ClientMember, value: string) => {
    onUpdateMember(id, { [field]: value });
  };

  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-8 transition-all duration-200 shadow-2xl shadow-black/20 ${
      isExpanded ? 'p-8' : 'p-6'
    }`}>
      <div className={isExpanded ? "mb-8" : "mb-0"}>
        <div className="flex items-center justify-between">
          <h2 className={`text-2xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent transition-all duration-200 ${
            isExpanded ? 'mb-2' : 'mb-0'
          }`}>
            Client Members
          </h2>
          <div className="flex items-center gap-3">
            {isExpanded && (
              <Button
                onClick={handleAddMember}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-md"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Expand
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick summary when collapsed */}
        {!isExpanded && (
          <div className="mt-3 text-sm text-slate-300">
            <span className="font-medium">{clientMembers.length} client member{clientMembers.length !== 1 ? 's' : ''}</span>
            {clientMembers.length > 0 && (
              <span className="ml-2">
                ({clientMembers.slice(0, 3).map(member => member.name).join(', ')}{clientMembers.length > 3 ? '...' : ''})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <>
          {clientMembers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-300 mb-4">No client members added yet</p>
              <Button
                onClick={handleAddMember}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
              >
                <Plus className="h-4 w-4" />
                Add First Client Member
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-sm font-medium text-slate-400 border-b border-white/10">
                <div>Name</div>
                <div>Email</div>
                <div>Company</div>
                <div>Call Time</div>
                <div>Dietary Restrictions</div>
                <div></div>
              </div>

              {clientMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 items-center min-w-0"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <InlineEdit
                      value={member.name}
                      onSave={(value) => handleFieldUpdate(member.id, 'name', value)}
                      placeholder="Name"
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div className="min-w-0">
                    <InlineEdit
                      value={member.email || ''}
                      onSave={(value) => handleFieldUpdate(member.id, 'email', value)}
                      placeholder="Email"
                      className="w-full"
                    />
                  </div>

                  {/* Company */}
                  <div className="min-w-0">
                    <InlineEdit
                      value={member.company || ''}
                      onSave={(value) => handleFieldUpdate(member.id, 'company', value)}
                      placeholder="Company"
                      className="w-full"
                    />
                  </div>

                  {/* Call Time */}
                  <div className="min-w-0">
                    <TimeInput12Hour
                      value={member.call_time || ''}
                      onSave={(value) => handleFieldUpdate(member.id, 'call_time', value)}
                      placeholder="Call Time"
                      className="w-full"
                    />
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="min-w-0">
                    <InlineEdit
                      value={member.allergies || ''}
                      onSave={(value) => handleFieldUpdate(member.id, 'allergies', value)}
                      placeholder="None"
                      className="w-full"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => onDeleteMember(member.id)}
                      size="sm"
                      variant="destructive"
                      className="p-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add Member Button Row */}
              <button
                onClick={handleAddMember}
                className="w-full p-3 text-slate-400 hover:text-white hover:bg-white/5 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Member
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};