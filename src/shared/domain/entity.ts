export interface Entity {
  id: string;
}

export interface TimestampedEntity extends Entity {
  createdAt: Date;
  updatedAt: Date;
}

export type ValueObject<T> = Readonly<T>;
