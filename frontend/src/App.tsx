import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { EurocampClient } from '@client/eurocamp-client';
import type {
  Booking,
  CreateBookingInput,
  CreateParcInput,
  CreateUserInput,
  Parc,
  User,
} from '@client/types';
import {
  createEmptyResourceState,
  formatFrontendError,
  formatTimestamp,
  nextBookingDateValue,
  type ResourceState,
} from './helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const client = new EurocampClient({
  baseUrl: import.meta.env.VITE_EUROCAMP_BASE_URL,
});

type UserFormState = CreateUserInput;
type ParcFormState = CreateParcInput;
type BookingFormState = {
  user: string;
  parc: string;
  bookingdate: string;
  comments: string;
};

type FormFeedback = {
  type: 'success' | 'error';
  message: string;
} | null;

const RESOURCE_PAGE_SIZE = 6;

function App() {
  const [users, setUsers] = useState<ResourceState<User>>(() => createEmptyResourceState<User>());
  const [parcs, setParcs] = useState<ResourceState<Parc>>(() => createEmptyResourceState<Parc>());
  const [bookings, setBookings] = useState<ResourceState<Booking>>(() =>
    createEmptyResourceState<Booking>()
  );

  const [userForm, setUserForm] = useState<UserFormState>({ name: '', email: '' });
  const [parcForm, setParcForm] = useState<ParcFormState>({ name: '', description: '' });
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    user: '',
    parc: '',
    bookingdate: nextBookingDateValue(),
    comments: '',
  });

  const [userFeedback, setUserFeedback] = useState<FormFeedback>(null);
  const [parcFeedback, setParcFeedback] = useState<FormFeedback>(null);
  const [bookingFeedback, setBookingFeedback] = useState<FormFeedback>(null);

  useEffect(() => {
    void refreshAll();
  }, []);

  useEffect(() => {
    if (!bookingForm.user && users.items[0]) {
      setBookingForm((current) => ({ ...current, user: users.items[0].id }));
    }
  }, [bookingForm.user, users.items]);

  useEffect(() => {
    if (!bookingForm.parc && parcs.items[0]) {
      setBookingForm((current) => ({ ...current, parc: parcs.items[0].id }));
    }
  }, [bookingForm.parc, parcs.items]);

  async function refreshAll(): Promise<void> {
    await Promise.all([refreshUsers(), refreshParcs(), refreshBookings()]);
  }

  async function refreshUsers(): Promise<void> {
    setUsers((current) => ({ ...current, loading: true, error: null }));

    try {
      const items = await client.listUsers();
      setUsers((current) => ({
        ...current,
        items,
        loading: false,
        error: null,
        lastUpdated: formatTimestamp(new Date()),
      }));
    } catch (error) {
      setUsers((current) => ({
        ...current,
        loading: false,
        error: formatFrontendError(error),
      }));
    }
  }

  async function refreshParcs(): Promise<void> {
    setParcs((current) => ({ ...current, loading: true, error: null }));

    try {
      const items = await client.listParcs();
      setParcs((current) => ({
        ...current,
        items,
        loading: false,
        error: null,
        lastUpdated: formatTimestamp(new Date()),
      }));
    } catch (error) {
      setParcs((current) => ({
        ...current,
        loading: false,
        error: formatFrontendError(error),
      }));
    }
  }

  async function refreshBookings(): Promise<void> {
    setBookings((current) => ({ ...current, loading: true, error: null }));

    try {
      const items = await client.listBookings();
      setBookings((current) => ({
        ...current,
        items,
        loading: false,
        error: null,
        lastUpdated: formatTimestamp(new Date()),
      }));
    } catch (error) {
      setBookings((current) => ({
        ...current,
        loading: false,
        error: formatFrontendError(error),
      }));
    }
  }

  async function selectUser(id: string): Promise<void> {
    setUsers((current) => ({
      ...current,
      selected: null,
      selectedError: null,
      detailLoading: true,
    }));

    try {
      const selected = await client.getUser(id);
      setUsers((current) => ({
        ...current,
        selected,
        selectedError: null,
        detailLoading: false,
      }));
    } catch (error) {
      setUsers((current) => ({
        ...current,
        selected: null,
        selectedError: formatFrontendError(error),
        detailLoading: false,
      }));
    }
  }

  async function selectParc(id: string): Promise<void> {
    setParcs((current) => ({
      ...current,
      selected: null,
      selectedError: null,
      detailLoading: true,
    }));

    try {
      const selected = await client.getParc(id);
      setParcs((current) => ({
        ...current,
        selected,
        selectedError: null,
        detailLoading: false,
      }));
    } catch (error) {
      setParcs((current) => ({
        ...current,
        selected: null,
        selectedError: formatFrontendError(error),
        detailLoading: false,
      }));
    }
  }

  async function selectBooking(id: string): Promise<void> {
    setBookings((current) => ({
      ...current,
      selected: null,
      selectedError: null,
      detailLoading: true,
    }));

    try {
      const selected = await client.getBooking(id);
      setBookings((current) => ({
        ...current,
        selected,
        selectedError: null,
        detailLoading: false,
      }));
    } catch (error) {
      setBookings((current) => ({
        ...current,
        selected: null,
        selectedError: formatFrontendError(error),
        detailLoading: false,
      }));
    }
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setUserFeedback(null);

    try {
      await client.createUser(userForm);
      setUserForm({ name: '', email: '' });
      setUserFeedback({
        type: 'success',
        message: 'User created. The list has been refreshed.',
      });
      await refreshUsers();
    } catch (error) {
      setUserFeedback({
        type: 'error',
        message: formatFrontendError(error),
      });
    }
  }

  async function handleCreateParc(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setParcFeedback(null);

    try {
      await client.createParc(parcForm);
      setParcForm({ name: '', description: '' });
      setParcFeedback({
        type: 'success',
        message: 'Parc created successfully.',
      });
      await refreshParcs();
    } catch (error) {
      setParcFeedback({
        type: 'error',
        message: formatFrontendError(error),
      });
    }
  }

  async function handleCreateBooking(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setBookingFeedback(null);

    const payload: CreateBookingInput = {
      user: bookingForm.user,
      parc: bookingForm.parc,
      bookingdate: new Date(bookingForm.bookingdate).toISOString(),
      comments: bookingForm.comments || undefined,
    };

    try {
      await client.createBooking(payload);
      setBookingForm((current) => ({
        ...current,
        bookingdate: nextBookingDateValue(),
        comments: '',
      }));
      setBookingFeedback({
        type: 'success',
        message: 'Booking created successfully.',
      });
      await refreshBookings();
    } catch (error) {
      setBookingFeedback({
        type: 'error',
        message: formatFrontendError(error),
      });
    }
  }

  return (
    <main className="min-h-screen bg-background font-sans selection:bg-primary/20 text-foreground pb-20">
      <div className="border-b border-border/40 bg-card/60">
        <div className="container mx-auto px-6 py-12 md:py-16 md:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary uppercase tracking-[0.2em]">
                Frontend Task
              </div>
              <h1 className="font-serif text-5xl tracking-tight md:text-7xl">
                API Control Room
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                A robust interface wrapped around the existing TypeScript client. Built for exploring, stress-testing, and demoing the Eurocamp API flows smoothly and reliably.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 text-[13px] tracking-wide">
              <span className="px-3 py-1.5 rounded bg-amber-500/10 text-amber-900 border border-amber-500/20 font-medium">Shared TS client</span>
              <span className="px-3 py-1.5 rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">Failure-aware UI</span>
              <span className="px-3 py-1.5 rounded bg-white/50 border border-border/60 text-foreground font-medium">Create + read flows</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 md:px-8 max-w-7xl space-y-16 mt-4">
        
        {/* Top Section: System Status & Stats */}
        <section className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-1 shadow-sm border-border/60 flex flex-col pt-2">
            <CardHeader className="pb-3">
              <CardDescription className="uppercase tracking-[0.2em] text-[11px] font-bold text-primary">System Status</CardDescription>
              <CardTitle className="text-xl font-medium tracking-tight mt-1">Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Some routes are intentionally flaky. The UI remains resilient and provides recovery options. Keep an eye on the failure states.
              </p>
              <Button className="w-full font-semibold uppercase tracking-wider text-[11px] h-10 mt-auto" onClick={() => void refreshAll()}>
                Refetch All Data
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 grid gap-6 sm:grid-cols-3">
            <StatTile title="Total Users" value={String(users.items.length)} meta={users.lastUpdated} />
            <StatTile title="Total Parcs" value={String(parcs.items.length)} meta={parcs.lastUpdated} />
            <StatTile title="Total Bookings" value={String(bookings.items.length)} meta={bookings.lastUpdated} />
          </div>
        </section>

        {/* Middle Section: Resources */}
        <section>
          <div className="mb-8 border-b border-border/40 pb-4">
            <h2 className="text-3xl font-serif tracking-tight">Resources</h2>
            <p className="text-[15px] mt-2 text-muted-foreground">Browse entities and inspect their detailed responses.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <ResourcePanel
              title="Users"
              subtitle="List reads reuse the shared client and handle transient upstream failures gracefully."
              state={users}
              onRefresh={() => void refreshUsers()}
              onSelect={selectUser}
              renderItem={(user) => (
                <>
                  <p className="font-semibold text-foreground text-[15px]">{user.name}</p>
                  <p className="truncate text-[13px] text-muted-foreground mt-0.5">{user.email}</p>
                </>
              )}
              renderDetail={(user) => (
                <>
                  <DetailRow label="Id" value={user.id} />
                  <DetailRow label="Name" value={user.name} />
                  <DetailRow label="Email" value={user.email} />
                </>
              )}
            />

            <ResourcePanel
              title="Parcs"
              subtitle="Parc detail reads are intentionally flaky, making this panel useful during stress testing."
              state={parcs}
              onRefresh={() => void refreshParcs()}
              onSelect={selectParc}
              renderItem={(parc) => (
                <>
                  <p className="font-semibold text-foreground text-[15px]">{parc.name}</p>
                  <p className="line-clamp-2 text-[13px] text-muted-foreground mt-0.5 leading-relaxed">{parc.description}</p>
                </>
              )}
              renderDetail={(parc) => (
                <>
                  <DetailRow label="Id" value={parc.id} />
                  <DetailRow label="Name" value={parc.name} />
                  <DetailRow label="Description" value={parc.description} />
                </>
              )}
            />

            <ResourcePanel
              title="Bookings"
              subtitle="Bookings validate the end-to-end flow across the entire API surface."
              state={bookings}
              onRefresh={() => void refreshBookings()}
              onSelect={selectBooking}
              renderItem={(booking) => (
                <>
                  <p className="font-semibold text-foreground text-[15px]">{booking.id.slice(0, 8)}</p>
                  <p className="truncate text-[13px] text-muted-foreground mt-0.5">{booking.bookingdate}</p>
                </>
              )}
              renderDetail={(booking) => (
                <>
                  <DetailRow label="Id" value={booking.id} />
                  <DetailRow label="User" value={booking.user} />
                  <DetailRow label="Parc" value={booking.parc} />
                  <DetailRow label="Booking date" value={booking.bookingdate} />
                  <DetailRow label="Comments" value={booking.comments ?? 'No comment'} />
                </>
              )}
            />
          </div>
        </section>

        {/* Bottom Section: Forms */}
        <section>
          <div className="mb-8 border-b border-border/40 pb-4 mt-8">
            <h2 className="text-3xl font-serif tracking-tight">Mutations</h2>
            <p className="text-[15px] mt-2 text-muted-foreground">Create new records to test the write operations.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <FormPanel
              title="Create user"
              description="Demonstrates the POST flow which fails intermittently on this API."
              badge="Flaky endpoint"
              onSubmit={(event) => void handleCreateUser(event)}
              feedback={userFeedback}
            >
              <Field label="Name">
                <Input
                  value={userForm.name}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Mary Harris"
                  required
                  className="bg-card/50"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(event) =>
                    setUserForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="mary@example.com"
                  required
                  className="bg-card/50"
                />
              </Field>
              <Button type="submit" className="mt-4 w-full font-semibold uppercase tracking-wider text-[11px]">
                Create user
              </Button>
            </FormPanel>

            <FormPanel
              title="Create parc"
              description="A straightforward creation flow indicating a stable endpoint."
              badge="Stable creation"
              onSubmit={(event) => void handleCreateParc(event)}
              feedback={parcFeedback}
            >
              <Field label="Name">
                <Input
                  value={parcForm.name}
                  onChange={(event) =>
                    setParcForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Forest retreat"
                  required
                  className="bg-card/50"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  rows={5}
                  value={parcForm.description}
                  onChange={(event) =>
                    setParcForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="A calm destination..."
                  required
                  className="bg-card/50 resize-none"
                />
              </Field>
              <Button type="submit" variant="secondary" className="mt-4 w-full font-semibold uppercase tracking-wider text-[11px] border border-border/60">
                Create parc
              </Button>
            </FormPanel>

            <FormPanel
              title="Create booking"
              description="Creates a cross-entity record combining user and parc logic."
              badge="Cross-entity"
              onSubmit={(event) => void handleCreateBooking(event)}
              feedback={bookingFeedback}
            >
              <Field label="User">
                <NativeSelect
                  value={bookingForm.user}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, user: event.target.value }))
                  }
                  required
                  className="bg-card/50"
                >
                  <option value="" disabled>
                    Select a user
                  </option>
                  {users.items.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Parc">
                <NativeSelect
                  value={bookingForm.parc}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, parc: event.target.value }))
                  }
                  required
                  className="bg-card/50"
                >
                  <option value="" disabled>
                    Select a parc
                  </option>
                  {parcs.items.map((parc) => (
                    <option key={parc.id} value={parc.id}>
                      {parc.name}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Booking date">
                <Input
                  type="datetime-local"
                  value={bookingForm.bookingdate}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, bookingdate: event.target.value }))
                  }
                  required
                  className="bg-card/50"
                />
              </Field>
              <Field label="Comments">
                <Textarea
                  rows={3}
                  value={bookingForm.comments}
                  onChange={(event) =>
                    setBookingForm((current) => ({ ...current, comments: event.target.value }))
                  }
                  placeholder="Notes..."
                  className="bg-card/50 resize-none"
                />
              </Field>
              <Button
                type="submit"
                variant="outline"
                className="mt-4 w-full font-semibold uppercase tracking-wider text-[11px] bg-background border-border/80"
                disabled={!users.items.length || !parcs.items.length}
              >
                Create booking
              </Button>
            </FormPanel>
          </div>
        </section>
      </div>
    </main>
  );
}

type ResourcePanelProps<T extends { id: string }> = {
  title: string;
  subtitle: string;
  state: ResourceState<T>;
  onRefresh: () => void;
  onSelect: (id: string) => void;
  renderItem: (item: T) => ReactNode;
  renderDetail: (item: T) => ReactNode;
};

function ResourcePanel<T extends { id: string }>({
  title,
  subtitle,
  state,
  onRefresh,
  onSelect,
  renderItem,
  renderDetail,
}: ResourcePanelProps<T>) {
  const [page, setPage] = useState(1);
  const totalItems = state.items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / RESOURCE_PAGE_SIZE));
  const pageStart = (page - 1) * RESOURCE_PAGE_SIZE;
  const visibleItems = state.items.slice(pageStart, pageStart + RESOURCE_PAGE_SIZE);
  const visibleRangeStart = totalItems ? pageStart + 1 : 0;
  const visibleRangeEnd = Math.min(pageStart + RESOURCE_PAGE_SIZE, totalItems);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  return (
    <Card className="h-full shadow-sm border-border/60 flex flex-col relative overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-5 bg-card/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl tracking-tight font-medium">{title}</CardTitle>
            <CardDescription className="mt-2 leading-relaxed text-[13px]">{subtitle}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-[10px] uppercase tracking-[0.15em] font-bold h-7 px-3 rounded-md" onClick={onRefresh}>
            Reload
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border/40">
          <StateBadge state={state} />
          {state.lastUpdated ? (
            <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Updated: {state.lastUpdated}</span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-6 flex-1 flex flex-col gap-6 bg-background/30">
        {state.error ? <FeedbackBanner feedback={{ type: 'error', message: state.error }} /> : null}

        <div className="grid gap-3">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="group rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-sm"
            >
              {renderItem(item)}
            </button>
          ))}
        </div>

        {totalItems > RESOURCE_PAGE_SIZE ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card/70 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {`Showing ${visibleRangeStart}-${visibleRangeEnd} of ${totalItems}`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.14em]"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="min-w-[64px] text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/80">
                {`${page} / ${totalPages}`}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.14em]"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {!state.loading && !state.items.length ? (
          <p className="text-[13px] text-muted-foreground italic">No data loaded yet.</p>
        ) : null}

        <div className="rounded-xl bg-card border border-border/60 p-5 mt-auto shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Inspector
            </p>
            {state.detailLoading ? (
              <span className="text-[11px] text-primary font-bold uppercase tracking-widest animate-pulse">Loading...</span>
            ) : null}
          </div>
          {state.selectedError ? (
            <FeedbackBanner feedback={{ type: 'error', message: state.selectedError }} />
          ) : state.selected ? (
            <div className="space-y-3">{renderDetail(state.selected)}</div>
          ) : (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Select an item above to inspect its details here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FormPanel(props: {
  title: string;
  description: string;
  badge: string;
  feedback: FormFeedback;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <Card className="h-full shadow-sm border-border/60 bg-card/40">
      <CardHeader className="border-b border-border/40 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl tracking-tight font-medium">{props.title}</CardTitle>
            <CardDescription className="mt-2 leading-relaxed text-[13px]">{props.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] tracking-[0.1em] uppercase font-bold text-foreground/80 border-border/80">
            {props.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-5" onSubmit={props.onSubmit}>
          {props.children}
          <div className="pt-1">
            <FeedbackBanner feedback={props.feedback} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StatTile(props: { title: string; value: string; meta: string | null; }) {
  return (
    <Card className="shadow-sm border-border/60 flex flex-col justify-between bg-card/60">
      <CardContent className="p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-3">{props.title}</p>
        <div className="flex items-baseline gap-3">
          <strong className="text-4xl font-serif tracking-tight text-foreground">{props.value}</strong>
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
          {props.meta ? `Last sync ${props.meta}` : 'Pending sync'}
        </p>
      </CardContent>
    </Card>
  );
}

function StateBadge<T>(props: { state: ResourceState<T> }) {
  if (props.state.loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        Processing
      </span>
    );
  }

  if (props.state.error) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
      Online
    </span>
  );
}

function DetailRow(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
        {props.label}
      </p>
      <p className="break-all text-[13px] text-foreground font-medium">{props.value}</p>
    </div>
  );
}

function Field(props: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] font-semibold text-foreground">{props.label}</span>
      {props.children}
    </label>
  );
}

function FeedbackBanner(props: { feedback: FormFeedback }) {
  if (!props.feedback) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-[13px] font-medium leading-relaxed',
        props.feedback.type === 'success'
          ? 'border-emerald-600/20 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300'
          : 'border-destructive/20 bg-destructive/10 text-destructive'
      )}
    >
      {props.feedback.message}
    </div>
  );
}

export default App;
