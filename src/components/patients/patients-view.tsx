'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  flexRender,
  type SortingState,
} from '@tanstack/react-table'
import { Search, LayoutGrid, Table2, ArrowUpDown, Pencil, Trash2, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { resolveOfficeColor } from '@/lib/offices'
import {
  patientFullName, patientIsBooked, patientApptDate,
  patientPhone, patientEmail, patientIsNew, formatDate, getOfficeColor,
  type Patient, type Office, type BillingRec,
} from '@/lib/patient-utils'
import { deletePatient } from '@/server/actions/patients'
import { toast } from 'sonner'
import { PatientProfileModal } from './patient-profile-modal'
import { DeleteConfirmModal } from '@/components/modals/delete-confirm-modal'

interface PatientsViewProps {
  allPatients: Patient[]
  allOffices: Office[]
  allBilling: BillingRec[]
}

type StatusFilter = 'all' | 'new' | 'reconciled' | 'leads'
type SortField = 'recorded' | 'apptDate' | 'alpha'

const columnHelper = createColumnHelper<Patient>()

export function PatientsView({ allPatients, allOffices }: PatientsViewProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('grid')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('recorded')
  const [officeFilter, setOfficeFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [profilePatient, setProfilePatient] = useState<Patient | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const officeMap = useMemo(() => new Map(allOffices.map((o) => [o.id, o])), [allOffices])

  // Filter + sort
  const filtered = useMemo(() => {
    let pts = [...allPatients]

    if (search) {
      const q = search.toLowerCase()
      pts = pts.filter((p) => patientFullName(p).toLowerCase().includes(q))
    }
    if (officeFilter) {
      pts = pts.filter((p) => {
        const o = officeMap.get(p.officeId)
        return o?.key === officeFilter
      })
    }
    if (statusFilter === 'new') {
      pts = pts.filter((p) => patientIsNew(p))
    } else if (statusFilter === 'leads') {
      pts = pts.filter((p) => !patientIsBooked(p))
    }

    if (sortField === 'recorded') {
      pts.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    } else if (sortField === 'apptDate') {
      pts.sort((a, b) => {
        const da = patientApptDate(a) || '9999'
        const db = patientApptDate(b) || '9999'
        return da.localeCompare(db)
      })
    } else {
      pts.sort((a, b) => patientFullName(a).localeCompare(patientFullName(b)))
    }

    return pts
  }, [allPatients, search, officeFilter, statusFilter, sortField, officeMap])

  const columns = useMemo(
    () => [
      columnHelper.accessor((p) => patientFullName(p), {
        id: 'name',
        header: 'Patient',
        cell: ({ row }) => {
          const p = row.original
          const office = officeMap.get(p.officeId)
          const color = getOfficeColor(office)
          return (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="font-semibold text-foreground">{patientFullName(p)}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor((p) => officeMap.get(p.officeId)?.name ?? '', {
        id: 'office',
        header: 'Office',
        cell: ({ getValue }) => (
          <span className="text-sm text-secondary-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.accessor((p) => patientPhone(p), {
        id: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => <span className="text-sm text-secondary-foreground">{getValue() || '—'}</span>,
      }),
      columnHelper.accessor((p) => (patientIsNew(p) ? 'New' : 'Returning'), {
        id: 'type',
        header: 'Type',
        cell: ({ getValue }) => {
          const v = getValue()
          return (
            <span className={cn('text-xs font-bold px-2 py-1 rounded-full', v === 'New' ? 'bg-accent text-pp-blue-dark' : 'bg-muted text-muted-foreground')}>
              {v}
            </span>
          )
        },
      }),
      columnHelper.accessor((p) => (patientIsBooked(p) ? 'Booked' : 'Not Booked'), {
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const v = getValue()
          return (
            <span className={cn('text-xs font-bold px-2 py-1 rounded-full', v === 'Booked' ? 'bg-pp-success-light text-pp-success' : 'bg-pp-orange-light text-pp-orange')}>
              {v}
            </span>
          )
        },
      }),
      columnHelper.accessor((p) => patientApptDate(p), {
        id: 'apptDate',
        header: 'Appt Date',
        cell: ({ getValue }) => <span className="text-sm text-secondary-foreground">{formatDate(getValue()) || '—'}</span>,
      }),
      columnHelper.accessor((p) => new Date(p.recordedAt).toLocaleDateString(), {
        id: 'recorded',
        header: 'Recorded',
        cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const p = row.original
          return (
            <div className="flex items-center gap-1 justify-end">
              <button
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                title="View profile"
                onClick={() => setProfilePatient(p)}
              >
                <Eye size={14} />
              </button>
              <button
                className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary transition-colors"
                title="Edit"
                onClick={() => router.push(`/onboarding?edit=${p.id}`)}
              >
                <Pencil size={14} />
              </button>
              <button
                className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
                onClick={() => setDeleteId(p.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        },
      }),
    ],
    [officeMap, router],
  )

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deletePatient(deleteId)
      toast.success('Patient deleted.')
    } catch {
      toast.error('Failed to delete patient.')
    }
    setDeleteId(null)
  }

  const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
    { key: 'all', label: `All (${allPatients.length})` },
    { key: 'new', label: `New (${allPatients.filter(patientIsNew).length})` },
    { key: 'leads', label: `Leads (${allPatients.filter((p) => !patientIsBooked(p)).length})` },
  ]

  return (
    <div className="p-7 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Status filter */}
        <div className="flex gap-1 border border-border rounded-lg overflow-hidden bg-white">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-colors',
                statusFilter === key
                  ? 'bg-primary text-white'
                  : 'text-secondary-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Office filter */}
        <div className="flex gap-1 border border-border rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setOfficeFilter('')}
            className={cn('px-3 py-1.5 text-xs font-semibold', !officeFilter ? 'bg-primary text-white' : 'text-secondary-foreground hover:bg-muted')}
          >
            All Offices
          </button>
          {allOffices.map((o) => (
            <button
              key={o.key}
              onClick={() => setOfficeFilter(o.key)}
              className={cn('px-3 py-1.5 text-xs font-semibold transition-colors', officeFilter === o.key ? 'text-white' : 'text-secondary-foreground hover:bg-muted')}
              style={officeFilter === o.key ? { backgroundColor: resolveOfficeColor(o) } : {}}
            >
              {o.abbr}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="h-9 px-2 rounded-lg border border-border text-xs font-semibold text-secondary-foreground bg-white"
        >
          <option value="recorded">Sort: Date Recorded</option>
          <option value="apptDate">Sort: Appointment Date</option>
          <option value="alpha">Sort: A–Z</option>
        </select>

        {/* View toggle */}
        <div className="ml-auto flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted')}
            title="Table view"
          >
            <Table2 size={16} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={cn('p-2 transition-colors', viewMode === 'cards' ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:bg-muted')}
            title="Cards view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Table view */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border bg-muted">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {h.isPlaceholder ? null : (
                          <div
                            className={cn('flex items-center gap-1', h.column.getCanSort() && 'cursor-pointer hover:text-secondary-foreground')}
                            onClick={h.column.getToggleSortingHandler()}
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getCanSort() && <ArrowUpDown size={11} className="opacity-50" />}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-muted-foreground text-sm">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-muted hover:bg-pp-hover-subtle transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border bg-muted flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {allPatients.length} patients
            </span>
          </div>
        </div>
      )}

      {/* Cards view */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
              No patients found
            </div>
          )}
          {filtered.map((p) => {
            const office = officeMap.get(p.officeId)
            const color = getOfficeColor(office)
            const booked = patientIsBooked(p)
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-1 w-full" style={{ backgroundColor: color }} />
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{patientFullName(p)}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{office?.name ?? '—'}</p>
                    </div>
                    <span
                      className={cn(
                        'text-[10.5px] font-bold px-2 py-0.5 rounded-full',
                        booked ? 'bg-pp-success-light text-pp-success' : 'bg-pp-orange-light text-pp-orange',
                      )}
                    >
                      {booked ? 'Booked' : 'Follow Up'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {patientPhone(p) && (
                      <p className="text-xs text-secondary-foreground">📞 {patientPhone(p)}</p>
                    )}
                    {patientApptDate(p) && (
                      <p className="text-xs text-secondary-foreground">📅 {formatDate(patientApptDate(p))}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Recorded: {new Date(p.recordedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-muted">
                    <button
                      className="flex-1 py-1 text-xs font-semibold text-primary hover:bg-accent rounded transition-colors"
                      onClick={() => setProfilePatient(p)}
                    >
                      View
                    </button>
                    <button
                      className="flex-1 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted rounded transition-colors"
                      onClick={() => router.push(`/onboarding?edit=${p.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 py-1 text-xs font-semibold text-destructive hover:bg-red-50 rounded transition-colors"
                      onClick={() => setDeleteId(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Patient Profile Modal */}
      {profilePatient && (
        <PatientProfileModal
          patient={profilePatient}
          office={officeMap.get(profilePatient.officeId)}
          open={!!profilePatient}
          onClose={() => setProfilePatient(null)}
          onEdit={() => {
            router.push(`/onboarding?edit=${profilePatient.id}`)
            setProfilePatient(null)
          }}
        />
      )}

      <DeleteConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        message="This will permanently delete the patient record and all associated reconciliation data."
      />
    </div>
  )
}
