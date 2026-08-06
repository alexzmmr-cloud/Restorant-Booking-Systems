-- Защита от двойного бронирования на уровне БД: один стол и один пользователь
-- не могут иметь два активных (pending/confirmed) бронирования на одно date+time.
-- Частичный индекс (только для активных статусов), т.к. отменённые/завершённые
-- бронирования не должны блокировать пересдачу освободившегося слота.

CREATE UNIQUE INDEX "Booking_tableId_date_time_active_key"
  ON "Booking" ("tableId", "date", "time")
  WHERE "status" IN ('pending', 'confirmed');

CREATE UNIQUE INDEX "Booking_userId_date_time_active_key"
  ON "Booking" ("userId", "date", "time")
  WHERE "status" IN ('pending', 'confirmed');
