export function formatBookingCreatedMessage(date: string, time: string, tableName: string): string {
  return `Бронирование на ${date} в ${time} создано, ожидает подтверждения. Стол: ${tableName}.`;
}

export function formatBookingCancelledByGuestMessage(date: string, time: string): string {
  return `Вы отменили бронирование на ${date} в ${time}.`;
}
