# ADR-003: Keine Demo-Daten im Produktivzweig

## Status
Akzeptiert

## Kontext
Das bestehende System enthielt Demo-/Seed-Daten im Produktivzweig, die automatisch in die Datenbank eingefügt wurden. Dies führte zu:
- Unrealistischen UI-Tests (immer mit Daten)
- Schwierigkeiten beim Testen von Empty-States
- Datenverschmutzung in Produktionsumgebungen
- Inkonsistenten Entwicklungsumgebungen

## Entscheidung
**Strikte "No Seeds Policy"**: Keine Demo-/Seed-Daten werden im Produktivzweig eingecheckt.

### Regeln:
1. **Keine Seed-Skripte im Repository**
2. **Empty-States sind First-Class Citizens**
3. **Tests verwenden ephemere Fixtures zur Laufzeit**
4. **UI muss ohne Daten funktional sein**

## Implementierung

### Test-Fixtures (Ephemer):
```typescript
// ✅ Erlaubt: Ephemere Test-Fixtures
export async function createTestTask(
  createdById: string, 
  overrides: Partial<any> = {}
) {
  const defaultTask = {
    title: `Test Task ${Date.now()}`,
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    createdById,
  };
  
  return await prisma.task.create({
    data: { ...defaultTask, ...overrides }
  });
}
```

### Empty-State Components:
```tsx
// ✅ Jede Liste braucht Empty-State
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<TaskIcon />}
        title="Keine Tasks vorhanden"
        description="Erstellen Sie Ihre erste Task, um loszulegen"
        action={<CreateTaskButton />}
      />
    );
  }
  
  return <TaskGrid tasks={tasks} />;
}
```

### Development Setup:
```bash
# ✅ Entwicklung startet mit leerer DB
npm run db:migrate
npm run dev

# ❌ Nicht erlaubt: Automatische Seed-Befüllung
# npm run db:seed
```

## Konsequenzen

### Positiv
- **Realistische UI-Tests**: Empty-States werden tatsächlich getestet
- **Saubere Produktionsumgebungen**: Keine Test-Daten
- **Bessere UX**: Empty-States sind durchdacht und hilfreich
- **Konsistente Entwicklung**: Jeder startet mit leerem Zustand
- **Performance**: Keine unnötigen Daten in der Datenbank

### Negativ
- **Mehr Aufwand**: Jede UI-Komponente braucht Empty-State-Handling
- **Langsamere Entwicklung**: Entwickler müssen manuell Test-Daten erstellen
- **Demo-Aufwand**: Präsentationen erfordern manuelle Datenerstellung

### Ausnahmen
- **System-Daten**: Notification-Types, System-Konfiguration erlaubt
- **Migrations**: Strukturelle Daten für DB-Integrität
- **Lokale Entwicklung**: Entwickler können lokal Seeds verwenden (nicht eingecheckt)

## Enforcement

### CI/CD Pipeline:
```yaml
# Überprüfung auf Seed-Dateien
- name: Check for seed files
  run: |
    if find . -name "*seed*" -type f | grep -E '\.(ts|js|sql)$'; then
      echo "❌ Seed files found in repository"
      exit 1
    fi
```

### Code Review Checklist:
- [ ] Keine Seed-/Demo-Daten eingecheckt
- [ ] Empty-States für neue Listen implementiert
- [ ] Tests verwenden ephemere Fixtures
- [ ] UI funktioniert ohne Daten

## Datum
2024-01-01
