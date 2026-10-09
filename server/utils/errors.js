// Detecta violação de unicidade (23505) tanto no erro direto do driver
// quanto no wrapper do Drizzle (DrizzleQueryError -> cause).
export function isUniqueViolation(err) {
  return err?.code === '23505' || err?.cause?.code === '23505' || /duplicate key|unique/i.test(err?.message || '');
}