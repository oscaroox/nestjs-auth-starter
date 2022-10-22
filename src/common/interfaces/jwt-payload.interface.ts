export type JWTAuthPayload = {
  uid: number;
};

export type GenericPayloadType = 'verify-email' | 'reset-password';

export type JWTGenericPayload = {
  type: GenericPayloadType;
} & JWTAuthPayload;
