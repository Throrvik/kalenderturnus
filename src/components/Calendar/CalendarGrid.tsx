import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeek,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  startOfMonth,
  startOfWeek,
  parseISO,
} from "date-fns";
import { nb } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  List,
  Plus,
  PlusCircle,
  Trash2,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarAssignment, useCalendarData } from "@/hooks/useCalendarData";
import { useToast } from "@/components/ui/use-toast";
import type { CalendarDeviation, ManualSchedule } from "@/lib/calendarStorage";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const PRESET_PATTERNS = [
  { value: "day", label: "Dagvakt (07:00–15:00)", pattern: "Dagvakt 07:00–15:00" },
  { value: "evening", label: "Kveldsvakt (15:00–23:00)", pattern: "Kveldsvakt 15:00–23:00" },
  { value: "night", label: "Nattevakt (23:00–07:00)", pattern: "Nattevakt 23:00–07:00" },
  {
    value: "weekday",
    label: "Mandag–fredag (08:00–16:00)",
    pattern: "Mandag–fredag 08:00–16:00",
  },
];

const MANUAL_SCHEDULE_COLORS = [
  "bg-shift-blue",
  "bg-shift-purple",
  "bg-shift-green",
  "bg-shift-orange",
  "bg-shift-teal",
  "bg-shift-pink",
  "bg-shift-yellow",
];

const MANUAL_SCHEDULE_LIMIT = 10;

const CUSTOM_PATTERN_HELP = "Bruk formatet X-Y/D, f.eks. 3-2/D.";

const SEVERITY_LABELS = {
  info: "Info",
  warning: "Advarsel",
  critical: "Kritisk",
} as const;

const SEVERITY_BADGE_CLASSES = {
  info: "bg-shift-blue/15 text-shift-blue",
  warning: "bg-shift-orange/15 text-shift-orange",
  critical: "bg-destructive/15 text-destructive",
} as const;

const SEVERITY_DOT_CLASSES = {
  info: "bg-shift-blue",
  warning: "bg-shift-orange",
  critical: "bg-destructive",
} as const;

type DayCellOptions = {
  compact?: boolean;
  contextMonth: number;
  contextYear: number;
};

type OverviewEntry = {
  id: string;
  label: string;
  pattern: string;
  colorClass: string;
  isManual: boolean;
  isOwn: boolean;
  isCloseColleague: boolean;
};

const toISODate = (date: Date) => format(date, "yyyy-MM-dd");

const isValidCustomPattern = (pattern: string) => {
  const trimmed = pattern.trim();
  if (!trimmed.includes("-") || !trimmed.includes("/")) {
    return false;
  }
  const [cycle, rhythm] = trimmed.split("/");
  if (!cycle || !rhythm) {
    return false;
  }
  const segments = cycle.split("-");
  if (segments.length < 2) {
    return false;
  }
  const hasInvalidSegment = segments.some((segment) => {
    if (!segment) return true;
    const value = Number.parseInt(segment, 10);
    return Number.isNaN(value) || value <= 0;
  });
  if (hasInvalidSegment) {
    return false;
  }
  return /^[A-Za-zÆØÅæøå]+$/.test(rhythm.trim());
};

const getNextManualScheduleColor = (schedules: ManualSchedule[]) => {
  for (const color of MANUAL_SCHEDULE_COLORS) {
    if (!schedules.some((schedule) => schedule.colorClass === color)) {
      return color;
    }
  }
  return MANUAL_SCHEDULE_COLORS[schedules.length % MANUAL_SCHEDULE_COLORS.length];
};

const manualScheduleSchema = z
  .object({
    name: z.string().trim().min(1, "Navn er påkrevd."),
    patternMode: z.enum(["preset", "custom"]),
    presetPattern: z.string().optional(),
    customPattern: z.string().optional(),
    startDate: z.string().min(1, "Velg startdato."),
  })
  .superRefine((data, ctx) => {
    if (data.patternMode === "preset") {
      if (!data.presetPattern) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["presetPattern"],
          message: "Velg et mønster.",
        });
      }
    } else if (!data.customPattern || !isValidCustomPattern(data.customPattern)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customPattern"],
        message: "Oppgi et gyldig mønster (X-Y/D).",
      });
    }
  });

const deviationSchema = z.object({
  colleagueId: z.string().min(1, "Velg kollega."),
  startDate: z.string().min(1, "Velg startdato."),
  duration: z.coerce
    .number({ invalid_type_error: "Varighet må være et tall." })
    .int("Varighet må være et heltall.")
    .min(1, "Varighet må være minst én dag.")
    .max(30, "Varighet kan ikke overstige 30 dager."),
  severity: z.enum(["info", "warning", "critical"]),
  pattern: z.string().optional(),
  keepRhythm: z.boolean().default(false),
  note: z.string().trim().min(1, "Beskriv avviket."),
});

type ManualScheduleFormValues = z.infer<typeof manualScheduleSchema>;
type DeviationFormValues = z.infer<typeof deviationSchema>;

const buildMonthMatrix = (targetYear: number, targetMonth: number) => {
  const start = startOfWeek(startOfMonth(new Date(targetYear, targetMonth, 1)), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date(targetYear, targetMonth, 1)), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
};

const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDeviationForm, setShowDeviationForm] = useState(false);
  const [confirmClearPending, setConfirmClearPending] = useState(false);

  const isMobile = useIsMobile();

  const {
    colleagues,
    assignmentsByDate,
    getAssignmentsForDate,
    addCustomShift,
    removeCustomShift,
    ensureYearLoaded,
    specialDates,
    manualSchedules,
    addManualSchedule,
    toggleManualSchedule,
    removeManualSchedule,
    clearManualSchedules,
    deviations,
    addDeviation,
    removeDeviation,
    selectedColleagueIds,
  } = useCalendarData();

  const { toast } = useToast();

  const manualScheduleForm = useForm<ManualScheduleFormValues>({
    resolver: zodResolver(manualScheduleSchema),
    defaultValues: {
      name: "",
      patternMode: "preset",
      presetPattern: "",
      customPattern: "",
      startDate: "",
    },
  });

  const deviationForm = useForm<DeviationFormValues>({
    resolver: zodResolver(deviationSchema),
    defaultValues: {
      colleagueId: "self",
      startDate: "",
      duration: 1,
      severity: "info",
      pattern: "",
      keepRhythm: false,
      note: "",
    },
  });

  const confirmClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const csrfTokenRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  );

  useEffect(() => {
    return () => {
      if (confirmClearTimer.current) {
        clearTimeout(confirmClearTimer.current);
      }
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const patternMode = manualScheduleForm.watch("patternMode");
  const manualScheduleLimitReached = manualSchedules.length >= MANUAL_SCHEDULE_LIMIT;

  const sortedManualSchedules = useMemo(
    () =>
      [...manualSchedules].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [manualSchedules]
  );

  const colleagueLookup = useMemo(
    () => new Map(colleagues.map((colleague) => [colleague.id, colleague])),
    [colleagues]
  );

  const overviewEntries = useMemo(() => {
    const entries = new Map<string, OverviewEntry>();

    Object.values(assignmentsByDate).forEach((dayAssignments) => {
      dayAssignments.forEach((assignment) => {
        const isVisible =
          assignment.isOwn || selectedColleagueIds.includes(assignment.colleagueId);
        if (!isVisible) {
          return;
        }
        const key = `${assignment.colleagueId}-${assignment.pattern}`;
        if (!entries.has(key)) {
          entries.set(key, {
            id: key,
            label: assignment.colleague.firstName,
            pattern: assignment.pattern,
            colorClass: assignment.colorClass,
            isManual: false,
            isOwn: assignment.isOwn,
            isCloseColleague: assignment.isCloseColleague,
          });
        }
      });
    });

    manualSchedules
      .filter((schedule) => schedule.enabled)
      .forEach((schedule) => {
        const key = `manual-${schedule.id}`;
        entries.set(key, {
          id: key,
          label: schedule.name,
          pattern: schedule.pattern,
          colorClass: schedule.colorClass,
          isManual: true,
          isOwn: true,
          isCloseColleague: true,
        });
      });

    return Array.from(entries.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "nb")
    );
  }, [assignmentsByDate, manualSchedules, selectedColleagueIds]);

  const sortedDeviations = useMemo(
    () => [...deviations].sort((a, b) => a.date.localeCompare(b.date)),
    [deviations]
  );

  useEffect(() => {
    ensureYearLoaded(year);
    ensureYearLoaded(year - 1);
    ensureYearLoaded(year + 1);
  }, [ensureYearLoaded, year]);

  const monthMatrix = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const yearMatrix = useMemo(
    () => MONTH_LABELS.map((_, monthIndex) => buildMonthMatrix(year, monthIndex)),
    [year]
  );

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDetails = (open: boolean) => {
    if (!open) {
      setSelectedDate(null);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setView("month");
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      if (view === "year") {
        return new Date(prev.getFullYear() - 1, prev.getMonth(), 1);
      }
      return addMonths(prev, -1);
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      if (view === "year") {
        return new Date(prev.getFullYear() + 1, prev.getMonth(), 1);
      }
      return addMonths(prev, 1);
    });
  };

  const renderDayCell = (date: Date, options: DayCellOptions) => {
    const { compact = false, contextMonth, contextYear } = options;
    const isoDate = toISODate(date);
    const contextDate = new Date(contextYear, contextMonth, 1);
    const isInContextMonth = isSameMonth(date, contextDate);
    const visibleAssignments = getAssignmentsForDate(isoDate);
    const allAssignments = assignmentsByDate[isoDate] ?? [];
    const hiddenCount = Math.max(allAssignments.length - visibleAssignments.length, 0);
    const specialDay = specialDates[isoDate];
    const hasDeviation = allAssignments.some((assignment) => assignment.deviation);
    const selected = selectedDate ? isSameDay(date, selectedDate) : false;
    const dayLabel = format(date, "d");
    const baseClasses = cn(
      "relative rounded-lg border bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80",
      compact ? "min-h-[64px] p-1.5" : "min-h-[96px] p-2",
      !isInContextMonth && "bg-muted/30 text-muted-foreground/70",
      isWeekend(date) && "bg-muted/50",
      hasDeviation && "border-destructive",
      isToday(date) && "border-2 border-primary shadow-sm",
      selected && "ring-2 ring-primary"
    );

    return (
      <button
        key={isoDate}
        type="button"
        className={baseClasses}
        onClick={() => handleDaySelect(date)}
        aria-label={`${format(date, "EEEE d. MMMM yyyy", { locale: nb })}`}
      >
        <div className={cn("flex items-center justify-between", compact ? "text-xs" : "text-sm font-medium")}>
          <span>{dayLabel}</span>
          {isToday(date) && (
            <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              I dag
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {visibleAssignments.slice(0, compact ? 3 : 4).map((assignment) => (
            <span
              key={assignment.id}
              className={cn("relative h-2.5 w-2.5 rounded-full", assignment.colorClass)}
            >
              {assignment.deviation && (
                <span className="absolute inset-0 rounded-full border border-destructive" />
              )}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground">+{hiddenCount}</span>
          )}
        </div>
        {!compact && specialDay && (
          <div
            className={cn(
              "mt-2 text-[10px] font-medium",
              specialDay.type === "holiday" ? "text-destructive" : "text-primary"
            )}
          >
            {specialDay.label}
          </div>
        )}
      </button>
    );
  };

  const selectedIsoDate = selectedDate ? toISODate(selectedDate) : null;
  const allAssignmentsForDay = selectedIsoDate
    ? getAssignmentsForDate(selectedIsoDate, { includeUnselected: true })
    : [];
  const visibleAssignmentsForDay = selectedIsoDate ? getAssignmentsForDate(selectedIsoDate) : [];
  const visibleAssignmentIds = new Set(visibleAssignmentsForDay.map((assignment) => assignment.id));
  const hiddenAssignments = allAssignmentsForDay.filter(
    (assignment) => !visibleAssignmentIds.has(assignment.id)
  );
  const customAssignmentsForDay = allAssignmentsForDay.filter((assignment) => assignment.source === "custom");

  const sortedAssignments = [...allAssignmentsForDay].sort((a, b) => {
    if (a.isOwn !== b.isOwn) {
      return a.isOwn ? -1 : 1;
    }
    if (a.isCloseColleague !== b.isCloseColleague) {
      return a.isCloseColleague ? -1 : 1;
    }
    return a.colleague.firstName.localeCompare(b.colleague.firstName, "nb");
  });

  const detailTitle = selectedDate
    ? `${format(selectedDate, "EEEE", { locale: nb })} ${format(selectedDate, "d. MMMM yyyy", { locale: nb })}`
    : "Ingen dag valgt";
  const detailWeekNumber = selectedDate ? getWeek(selectedDate, { weekStartsOn: 1 }) : null;
  const detailSpecialDay = selectedIsoDate ? specialDates[selectedIsoDate] : undefined;

  const handleAddCustomShift = () => {
    if (!selectedDate) return;
    const isoDate = toISODate(selectedDate);
    const suffix = customAssignmentsForDay.length + 1;
    const label = customAssignmentsForDay.length
      ? `Egendefinert turnus #${suffix}`
      : `Egendefinert turnus ${format(selectedDate, "d. MMM", { locale: nb })}`;

    addCustomShift({
      date: isoDate,
      label,
      shiftType: "custom",
    });
  };

  const handleManualScheduleSubmit = (values: ManualScheduleFormValues) => {
    const trimmedName = values.name.trim();
    const pattern =
      values.patternMode === "preset"
        ? PRESET_PATTERNS.find((item) => item.value === values.presetPattern)?.pattern ?? ""
        : values.customPattern?.trim().toUpperCase() ?? "";

    if (!pattern) {
      toast({
        title: "Ufullstendig mønster",
        description:
          "Velg et forhåndsdefinert mønster eller oppgi et egendefinert X-Y/D-mønster.",
        variant: "destructive",
      });
      return;
    }

    if (manualScheduleLimitReached) {
      toast({
        title: "Maksgrense nådd",
        description: `Du kan registrere maks ${MANUAL_SCHEDULE_LIMIT} manuelle turnuser.`,
        variant: "destructive",
      });
      return;
    }

    const duplicateName = manualSchedules.some(
      (schedule) => schedule.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicateName) {
      toast({
        title: "Turnusen finnes allerede",
        description: "Gi turnusen et unikt navn for å unngå forveksling.",
        variant: "destructive",
      });
      return;
    }

    addManualSchedule({
      name: trimmedName,
      pattern,
      startDate: values.startDate,
      colorClass: getNextManualScheduleColor(manualSchedules),
      enabled: true,
      patternType: values.patternMode,
    });

    toast({
      title: "Turnus lagret",
      description: `${trimmedName} er lagret som manuell turnus.`,
    });

    manualScheduleForm.reset({
      name: "",
      patternMode: values.patternMode,
      presetPattern: values.patternMode === "preset" ? values.presetPattern ?? "" : "",
      customPattern: "",
      startDate: "",
    });
  };

  const handleClearManualSchedules = () => {
    if (!confirmClearPending) {
      setConfirmClearPending(true);
      toast({
        title: "Bekreft tømming",
        description: "Klikk «Tøm skjema» en gang til for å fjerne alle manuelle turnuser.",
      });
      if (confirmClearTimer.current) {
        clearTimeout(confirmClearTimer.current);
      }
      confirmClearTimer.current = setTimeout(() => {
        setConfirmClearPending(false);
        confirmClearTimer.current = null;
      }, 4000);
      return;
    }

    clearManualSchedules();
    manualScheduleForm.reset({
      name: "",
      patternMode: "preset",
      presetPattern: "",
      customPattern: "",
      startDate: "",
    });
    setConfirmClearPending(false);
    if (confirmClearTimer.current) {
      clearTimeout(confirmClearTimer.current);
      confirmClearTimer.current = null;
    }
    toast({
      title: "Manuelle turnuser slettet",
      description: "Alle manuelle turnuser er fjernet. Kollega-data beholdes.",
    });
  };

  const handleRemoveManualSchedule = (id: string) => {
    const schedule = manualSchedules.find((item) => item.id === id);
    removeManualSchedule(id);
    toast({
      title: "Turnus fjernet",
      description: schedule
        ? `${schedule.name} er fjernet fra listen.`
        : "Turnusen er fjernet.",
    });
  };

  const handleDeviationSubmit = (values: DeviationFormValues) => {
    const start = parseISO(values.startDate);
    if (Number.isNaN(start.getTime())) {
      toast({
        title: "Ugyldig dato",
        description: "Kunne ikke tolke valgt dato. Prøv igjen.",
        variant: "destructive",
      });
      return;
    }

    const duration = values.duration;
    const entries: CalendarDeviation[] = [];
    for (let index = 0; index < duration; index++) {
      const current = addDays(start, index);
      const isoDate = toISODate(current);
      const shiftId = `${values.colleagueId}-${isoDate}`;
      entries.push({
        id: `dev-${shiftId}`,
        date: isoDate,
        shiftId,
        colleagueId: values.colleagueId,
        note: values.note.trim(),
        severity: values.severity,
        pattern: values.pattern?.trim() ? values.pattern.trim() : undefined,
        durationDays: duration,
        keepRhythm: values.keepRhythm,
      });
    }

    const existingShiftIds = new Set(deviations.map((item) => item.shiftId));
    const overwritten = entries.filter((entry) => existingShiftIds.has(entry.shiftId)).length;

    addDeviation(entries);

    toast({
      title: "Avvik registrert",
      description:
        overwritten > 0
          ? `${entries.length} avvik er lagret (${overwritten} oppdatert).`
          : `${entries.length} avvik er lagret i kalenderen.`,
    });

    deviationForm.reset({
      colleagueId: values.colleagueId,
      startDate: "",
      duration: 1,
      severity: values.severity,
      pattern: "",
      keepRhythm: values.keepRhythm,
      note: "",
    });
    setShowDeviationForm(false);
  };

  const handleRemoveDeviation = (shiftId: string) => {
    const deviation = deviations.find((item) => item.shiftId === shiftId);
    removeDeviation(shiftId);
    const colleagueName = deviation
      ? colleagueLookup.get(deviation.colleagueId)?.firstName ?? deviation.colleagueId
      : null;
    toast({
      title: "Avvik fjernet",
      description: colleagueName
        ? `Avviket for ${colleagueName} er fjernet.`
        : "Avviket er fjernet.",
    });
  };

  const detailContent = selectedDate ? (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Uke {detailWeekNumber}</p>
        <h3 className="text-xl font-semibold leading-tight">{detailTitle}</h3>
      </div>
      {detailSpecialDay && (
        <div className="rounded-md bg-muted/60 p-3 text-sm">
          <p className="font-medium">
            {detailSpecialDay.label}
            {detailSpecialDay.type === "holiday" && " · Rød dag"}
          </p>
          {detailSpecialDay.description && (
            <p className="text-muted-foreground">{detailSpecialDay.description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {sortedAssignments.length > 0 ? (
          sortedAssignments.map((assignment: CalendarAssignment) => {
            const isVisible = visibleAssignmentIds.has(assignment.id);
            const deviationSeverity = assignment.deviation?.severity ?? "info";
            const deviationTone =
              deviationSeverity === "critical"
                ? "text-destructive"
                : deviationSeverity === "warning"
                ? "text-amber-600"
                : "text-primary";

            return (
              <div key={assignment.id} className="flex gap-3 rounded-md border border-border/60 p-3">
                <span
                  className={cn("relative mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full", assignment.colorClass)}
                >
                  {assignment.deviation && (
                    <span className="absolute inset-0 rounded-full border border-destructive" />
                  )}
                </span>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {assignment.colleague.firstName}
                      {assignment.isOwn ? " (meg)" : ""}
                    </span>
                    {assignment.isCloseColleague && !assignment.isOwn && (
                      <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                        Nær kollega
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{assignment.pattern}</span>
                  </div>
                  {!isVisible && (
                    <span className="text-xs text-muted-foreground">
                      Skjult i kalendervisning (kollega ikke valgt)
                    </span>
                  )}
                  {assignment.deviation && (
                    <span className={cn("text-xs", deviationTone)}>{assignment.deviation.note}</span>
                  )}
                </div>
                {assignment.source === "custom" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 text-xs"
                    onClick={() => removeCustomShift(assignment.id)}
                  >
                    Fjern
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Ingen turnuser registrert denne dagen.</p>
        )}
      </div>
      {hiddenAssignments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {hiddenAssignments.length} turnus(er) er skjult fordi kollegaen ikke er valgt i kalenderen.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAddCustomShift} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Legg til egendefinert turnus
        </Button>
        {customAssignmentsForDay.map((assignment) => (
          <Button
            key={assignment.id}
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => removeCustomShift(assignment.id)}
          >
            Fjern «{assignment.label}»
          </Button>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Velg en dag i kalenderen for detaljer.</p>
  );

  return (
    <div className="w-full">
      <Tabs value={view} onValueChange={(v) => setView(v as "month" | "year")} className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {view === "month" ? `${MONTH_LABELS[month]} ${year}` : year}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="month" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Måned
              </TabsTrigger>
              <TabsTrigger value="year" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                År
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                I dag
              </Button>
              <Button variant="outline" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="month" className="mt-0 space-y-2">
          <div className="grid grid-cols-8 gap-2">
            <div className="text-center text-sm font-semibold text-muted-foreground">Uke</div>
            {WEEKDAY_LABELS.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "text-center text-sm font-semibold text-muted-foreground",
                  idx === 6 && "text-destructive"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {monthMatrix.map((week, weekIndex) => {
              const weekNumber = getWeek(week[0], { weekStartsOn: 1 });
              return (
                <div key={`week-${weekIndex}`} className="grid grid-cols-8 gap-2">
                  <div className="flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    Uke {weekNumber}
                  </div>
                  {week.map((date) =>
                    renderDayCell(date, { compact: false, contextMonth: month, contextYear: year })
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="year" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MONTH_LABELS.map((monthLabel, monthIndex) => (
              <Card key={monthLabel} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{monthLabel}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCurrentDate(new Date(year, monthIndex, 1));
                      setView("month");
                    }}
                  >
                    Gå til måned
                  </Button>
                </div>
                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map((day, idx) => (
                    <div
                      key={`${monthLabel}-${day}`}
                      className={cn(
                        "text-center text-xs font-semibold text-muted-foreground",
                        idx === 6 && "text-destructive"
                      )}
                    >
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {yearMatrix[monthIndex].map((week, weekIndex) => (
                    <div key={`${monthLabel}-week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                      {week.map((date) =>
                        renderDayCell(date, { compact: true, contextMonth: monthIndex, contextYear: year })
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isMobile ? (
        <Drawer open={!!selectedDate} onOpenChange={handleCloseDetails}>
          <DrawerContent>
            <DrawerHeader className="pb-2">
              <DrawerTitle>{detailTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4 pb-6">{detailContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedDate} onOpenChange={handleCloseDetails}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{detailTitle}</DialogTitle>
            </DialogHeader>
            {detailContent}
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Legg til manuell turnus</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              Maks {MANUAL_SCHEDULE_LIMIT}
            </Badge>
          </div>
          <Form {...manualScheduleForm}>
            <form
              onSubmit={manualScheduleForm.handleSubmit(handleManualScheduleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={manualScheduleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turnusnavn</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Høstvakt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={manualScheduleForm.control}
                name="patternMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mønster</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-2"
                      >
                        <FormItem className="flex items-center gap-2 rounded-md border p-2">
                          <FormControl>
                            <RadioGroupItem value="preset" />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Forhåndsdefinert</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2 rounded-md border p-2">
                          <FormControl>
                            <RadioGroupItem value="custom" />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">Egendefinert</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {patternMode === "preset" ? (
                <FormField
                  control={manualScheduleForm.control}
                  name="presetPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Velg mønster</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg turnusmønster" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRESET_PATTERNS.map((pattern) => (
                              <SelectItem key={pattern.value} value={pattern.value}>
                                <div className="flex flex-col">
                                  <span>{pattern.label}</span>
                                  <span className="text-xs text-muted-foreground">{pattern.pattern}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={manualScheduleForm.control}
                  name="customPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Egendefinert mønster</FormLabel>
                      <FormControl>
                        <Input placeholder="For eksempel 3-2/D" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">{CUSTOM_PATTERN_HELP}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={manualScheduleForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startdato</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Startdatoen brukes for å plassere mønsteret i kalenderen.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={manualScheduleLimitReached} className="gap-2">
                  <Plus className="h-4 w-4" /> Lagre turnus
                </Button>
                <Button type="button" variant="outline" onClick={handleClearManualSchedules}>
                  {confirmClearPending ? "Bekreft tømming" : "Tøm skjema"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Du kan registrere opptil {MANUAL_SCHEDULE_LIMIT} manuelle turnuser per bruker.
              </p>
              {manualScheduleLimitReached && (
                <p className="text-xs font-medium text-destructive">
                  Maksgrensen er nådd. Fjern en turnus før du legger til en ny.
                </p>
              )}
            </form>
          </Form>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Turnus-oversikt</h3>
          </div>
          {overviewEntries.length > 0 ? (
            <div className="space-y-3">
              {overviewEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-dashed p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-3 w-3 rounded-sm border border-border/60", entry.colorClass)} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{entry.label}</span>
                      <span className="text-xs text-muted-foreground">{entry.pattern}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.isManual && (
                      <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                        Manuell
                      </Badge>
                    )}
                    {entry.isOwn && !entry.isManual && (
                      <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                        Min turnus
                      </Badge>
                    )}
                    {!entry.isManual && entry.isCloseColleague && !entry.isOwn && (
                      <Badge variant="outline" className="text-xs uppercase tracking-wide">
                        Nær kollega
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ingen turnuser er synlige akkurat nå. Velg kollegaer eller registrer manuelle turnuser for å se dem
              her.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Mine manuelle turnuser</h3>
          </div>
          {sortedManualSchedules.length > 0 ? (
            <div className="space-y-3">
              {sortedManualSchedules.map((schedule) => {
                const startLabel = schedule.startDate
                  ? format(parseISO(schedule.startDate), "d. MMM yyyy", { locale: nb })
                  : "Ikke satt";
                return (
                  <div
                    key={schedule.id}
                    className="flex flex-col gap-3 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <span className={cn("mt-1 h-3 w-3 rounded-sm border border-border/60", schedule.colorClass)} />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{schedule.name}</span>
                          <Badge
                            variant={schedule.enabled ? "secondary" : "outline"}
                            className="text-xs uppercase tracking-wide"
                          >
                            {schedule.enabled ? "Synlig" : "Skjult"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{schedule.pattern}</p>
                        <p className="text-xs text-muted-foreground">Start: {startLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={(value) => toggleManualSchedule(schedule.id, value)}
                        aria-label={`Skru ${schedule.enabled ? "av" : "på"} ${schedule.name}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveManualSchedule(schedule.id)}
                        aria-label={`Slett ${schedule.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ingen manuelle turnuser registrert ennå. Bruk skjemaet for å legge til en turnus.
            </p>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold">Avvik</h3>
            </div>
            <Button
              variant={showDeviationForm ? "outline" : "default"}
              size="sm"
              className="gap-2"
              onClick={() => setShowDeviationForm((prev) => !prev)}
            >
              <PlusCircle className="h-4 w-4" /> {showDeviationForm ? "Lukk skjema" : "Registrer avvik"}
            </Button>
          </div>

          {showDeviationForm && (
            <Form {...deviationForm}>
              <form onSubmit={deviationForm.handleSubmit(handleDeviationSubmit)} className="mb-4 space-y-4">
                <input type="hidden" name="csrf_token" value={csrfTokenRef.current} />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={deviationForm.control}
                    name="colleagueId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kollega</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg kollega" />
                            </SelectTrigger>
                            <SelectContent>
                              {colleagues.map((colleague) => (
                                <SelectItem key={colleague.id} value={colleague.id}>
                                  {colleague.firstName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deviationForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Startdato</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deviationForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Varighet (dager)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(event.target.value)}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Antall sammenhengende dager avviket gjelder.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={deviationForm.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alvorlighetsgrad</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Velg alvorlighetsgrad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warning">Advarsel</SelectItem>
                              <SelectItem value="critical">Kritisk</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={deviationForm.control}
                  name="pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mønster under avvik</FormLabel>
                      <FormControl>
                        <Input placeholder="F.eks. Dagvakt" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Valgfritt. Beskriv midlertidig mønster eller notat til kollegaer.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={deviationForm.control}
                  name="keepRhythm"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 p-3">
                        <div>
                          <FormLabel className="text-sm">Behold rytme</FormLabel>
                          <FormDescription className="text-xs">
                            Slå av hvis turnusen skal forskyves etter avviket.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={deviationForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beskrivelse</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Beskriv hva som endres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" className="gap-2">
                    <Plus className="h-4 w-4" /> Lagre avvik
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <div className="space-y-3">
            {sortedDeviations.length > 0 ? (
              sortedDeviations.map((deviation) => {
                const colleague = colleagueLookup.get(deviation.colleagueId);
                const badgeClass = SEVERITY_BADGE_CLASSES[deviation.severity];
                const dotClass = SEVERITY_DOT_CLASSES[deviation.severity];
                const deviationDate = format(parseISO(deviation.date), "d. MMM yyyy", { locale: nb });
                return (
                  <div key={deviation.id} className="rounded-md border border-border/60 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {colleague ? colleague.firstName : deviation.colleagueId}
                          </span>
                          <span className="text-xs text-muted-foreground">{deviationDate}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={cn("text-xs", badgeClass)}>
                        {SEVERITY_LABELS[deviation.severity]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm">{deviation.note}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex flex-wrap items-center gap-3">
                        <span>Varighet: {deviation.durationDays ?? 1} dag(er)</span>
                        {deviation.pattern && <span>Mønster: {deviation.pattern}</span>}
                        <span>Rytme: {deviation.keepRhythm ? "Beholdes" : "Flyttes"}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDeviation(deviation.shiftId)}
                        aria-label="Slett avvik"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                Ingen avvik registrert ennå. Registrer et avvik for å fremheve endringer i kalenderen.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarGrid;
