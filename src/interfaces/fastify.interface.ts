import { FastifyRequest, FastifyReply } from 'fastify';

export interface Request extends FastifyRequest {}
export interface Response extends FastifyReply {}
