import type { View } from "react-big-calendar";
import type { Guest } from "../guests/types";

export type BookingStatus = "geplant" | "durchgefuehrt" | "storniert";
export type BookingSource = "intern" | "anfrage" | "online";

export type GuestDto = Guest;

export interface TeacherDto {
  id: string;
  name: string | null;
  email: string;
  colorIndex: number;
}

export interface CourseTypeDto {
  id: string;
  name: string;
  durationMin: number;
  priceCHF: string;
  maxParticipants: number;
  isPublic: boolean;
  isActive: boolean;
}

export interface BookingWithDetailsDto {
  id: string;
  teacherId: string;
  guestId: string;
  courseTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  source: BookingSource;
  notes: string | null;
  priceCHF: string;
  createdAt: string;
  guest: GuestDto;
  teacher: TeacherDto;
  courseType: CourseTypeDto;
}

export type CalendarEventResource = BookingWithDetailsDto;

export interface CalendarEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarEventResource;
}

export interface CreateBookingInput {
  teacherId: string;
  guestId: string;
  courseTypeId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  priceCHF?: string;
  source?: BookingSource;
}

export interface UpdateBookingInput {
  teacherId?: string;
  guestId?: string;
  courseTypeId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
  priceCHF?: string;
  status?: BookingStatus;
  source?: BookingSource;
}

export type CalendarViewName = View;
