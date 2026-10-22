"use client";

import { useCallback, useEffect, useState } from "react";
import {
  localStorageRoomRepository,
  type MatchRoom,
  type RoomRepository,
  type SaveRoomInput,
} from "@/features/matching/data/roomRepository";
import { getRoomsAction, saveRoomAction } from "@/features/matching/actions/roomActions";

export function useRooms(repository: RoomRepository = localStorageRoomRepository) {
  const [rooms, setRooms] = useState<MatchRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getRoomsAction(repository).then((result) => {
      if (!isCurrent) return;
      if (result.success) {
        setRooms(result.data);
        return;
      }
      setError(result.error.message);
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [repository]);

  const saveRoom = useCallback(async (input: SaveRoomInput) => {
    const result = await saveRoomAction(repository, input);
    if (result.success) {
      setRooms((currentRooms) => [
        result.data,
        ...currentRooms.filter((room) => room.id !== result.data.id),
      ]);
      setError(null);
    } else {
      setError(result.error.message);
    }
    return result;
  }, [repository]);

  return { rooms, isLoading, error, saveRoom };
}
