import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Sparkles, Plus } from 'lucide-react';
import SortableTaskCard from './SortableTaskCard';

export default function KanbanColumn({
  col,
  tasks = [],
  onEditTask,
  onAddTask,
}) {
  const colId = typeof col === 'string' ? col : col?.id;
  const colObj = typeof col === 'object' && col !== null ? col : { id: colId, label: colId };

  const { setNodeRef, isOver } = useDroppable({
    id: colId,
    data: {
      type: 'Column',
      colId,
    },
  });

  return (
    <div
      className={`flex flex-col rounded-2xl border ${colObj.border || 'border-slate-200'} overflow-hidden transition-all duration-200 ${
        isOver ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : ''
      }`}
      style={{ minHeight: '450px' }}
    >
      {/* Column Header */}
      <div
        className={`${colObj.headerBg || 'bg-slate-50'} px-4 py-3 border-b ${
          colObj.border || 'border-slate-200'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${colObj.dot || 'bg-slate-400'}`} />
          <span className="text-xs font-bold text-slate-700">{colObj.label}</span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border text-slate-600"
          style={{ borderColor: (colObj.color || '#6366f1') + '40' }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable Task List Container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 flex flex-col gap-3 bg-slate-50/50 min-h-[250px]"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onClick={() => onEditTask && onEditTask(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center pointer-events-none border border-dashed border-slate-200/80 rounded-xl my-1">
            <Sparkles className="h-6 w-6 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              No tasks in {colObj.label}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onAddTask && onAddTask(colId)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition cursor-pointer mt-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task to {colObj.label}
        </button>
      </div>
    </div>
  );
}

