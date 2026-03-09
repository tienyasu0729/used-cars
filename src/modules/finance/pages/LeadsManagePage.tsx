import { useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeApi } from '@/api/financeApi'
import { formatVnd } from '@/utils/formatters'
import type { FinanceLead } from '@/api/financeApi'

const COLUMNS: { id: FinanceLead['status']; title: string }[] = [
  { id: 'new', title: 'New Leads' },
  { id: 'under_review', title: 'Under Review' },
  { id: 'approved', title: 'Approved' },
  { id: 'rejected', title: 'Rejected' },
]

function LeadCard({ lead }: { lead: FinanceLead }) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <p className="font-medium text-gray-900">{lead.customerName}</p>
      <p className="text-sm text-gray-500">{lead.phone}</p>
      <p className="text-sm mt-2">{lead.carInterest}</p>
      <p className="text-[#FF6600] font-semibold mt-1">{formatVnd(lead.loanAmount)}</p>
    </div>
  )
}

export function LeadsManagePage() {
  const queryClient = useQueryClient()

  const { data: leads = [] } = useQuery({
    queryKey: ['finance-leads'],
    queryFn: () => financeApi.getLeads(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FinanceLead['status'] }) =>
      financeApi.updateLeadStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finance-leads'] }),
  })

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      const status = result.destination.droppableId as FinanceLead['status']
      const leadId = result.draggableId
      updateMutation.mutate({ id: leadId, status })
    },
    [updateMutation]
  )

  const getLeadsByStatus = (status: FinanceLead['status']) =>
    leads.filter((l) => l.status === status)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#FF6600] mb-6">Quản lý Hồ sơ (Leads)</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 rounded-lg p-4 min-h-[300px]"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">{col.title}</h3>
                  <div className="space-y-3">
                    {getLeadsByStatus(col.id).map((lead, idx) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <LeadCard lead={lead} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
