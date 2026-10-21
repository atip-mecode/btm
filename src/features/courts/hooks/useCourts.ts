"use client";

import { useCallback, useEffect, useState } from "react";
import {
  localStorageCourtRepository,
  type Court,
  type CourtRepository,
} from "@/features/courts/data/courtRepository";
import {
  addCourtAction,
  getCourtsAction,
  saveSelectedCourtsAction,
} from "@/features/courts/actions/courtActions";

export function useCourts(repository: CourtRepository = localStorageCourtRepository) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getCourtsAction(repository).then((result) => {
      if (!isCurrent) return;
      if (result.success) {
        setCourts(result.data.courts);
        setSelectedCourtIds(result.data.selectedCourtIds);
      } else {
        setError(result.error.message);
      }
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [repository]);

  const toggleCourt = useCallback(async (courtId: string) => {
    const nextIds = selectedCourtIds.includes(courtId)
      ? selectedCourtIds.filter((id) => id !== courtId)
      : [...selectedCourtIds, courtId];
    const result = await saveSelectedCourtsAction(repository, nextIds);
    if (result.success) {
      setSelectedCourtIds(result.data);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository, selectedCourtIds]);

  const addCourt = useCallback(async (input: { name: string; hours: number }) => {
    const result = await addCourtAction(repository, input);
    if (result.success) {
      setCourts((currentCourts) => [...currentCourts, result.data.court]);
      setSelectedCourtIds(result.data.selectedCourtIds);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository]);

  return { courts, selectedCourtIds, isLoading, error, toggleCourt, addCourt };
}
