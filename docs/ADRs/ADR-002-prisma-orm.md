# ADR-002: Migration zu Prisma ORM

## Status
Akzeptiert

## Kontext
Das bestehende System verwendete raw SQL-Queries mit `pg`-Client. Dies führte zu:
- Fehlender Type-Safety bei Datenbankzugriffen
- Manueller Schema-Synchronisation zwischen Code und Datenbank
- Schwieriger Wartbarkeit von Migrationen
- Inkonsistenten Datenbankzugriffen zwischen verschiedenen Services

## Entscheidung
Wir migrieren zu Prisma ORM als primärer Datenbank-Layer:

### Vorteile von Prisma:
- **Type-Safety**: Automatisch generierte TypeScript-Types
- **Schema-First**: Deklarative Schema-Definition
- **Migrationen**: Automatische Migration-Generierung
- **Introspection**: Schema-Synchronisation mit bestehender DB
- **Query Builder**: Typisierte und optimierte Queries
- **Relation Loading**: Effiziente Include/Select-Patterns

### Alternative Optionen:
- **TypeORM**: Mehr Flexibilität, aber komplexere Konfiguration
- **Drizzle**: Performanter, aber weniger Ecosystem-Support
- **Sequelize**: Mature, aber fehlende TypeScript-Integration

## Implementierung

### Schema-Migration:
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  ownedProjects Project[] @relation("ProjectOwner")
  assignedTasks Task[]    @relation("TaskAssignee")
  
  @@map("users")
}
```

### Repository Pattern:
```typescript
export class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string;

  async findById(id: string): Promise<T | null> {
    return await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    });
  }
}
```

## Konsequenzen

### Positiv
- Vollständige Type-Safety für alle DB-Operationen
- Automatische Schema-Validierung
- Vereinfachte Migration-Workflows
- Bessere Developer Experience mit Autocomplete
- Optimierte Query-Performance durch Prisma-Engine
- Einheitliche Repository-Pattern möglich

### Negativ
- Breaking Change: Bestehende SQL-Queries müssen migriert werden
- Lernkurve für Team-Mitglieder
- Zusätzliche Build-Dependencies (Prisma Generate)
- Vendor Lock-in zu Prisma

### Migration Strategy
1. **Phase 1**: Prisma Schema basierend auf bestehender DB erstellen
2. **Phase 2**: Repository-Classes mit Prisma implementieren
3. **Phase 3**: Service-Layer auf neue Repositories umstellen
4. **Phase 4**: Legacy SQL-Code entfernen

## Rollback Plan
- Prisma Client kann parallel zu pg-Client verwendet werden
- Schrittweise Migration möglich ohne Big-Bang-Approach
- Bei kritischen Issues: Rückfall auf bestehende SQL-Implementierung

## Datum
2024-01-01
