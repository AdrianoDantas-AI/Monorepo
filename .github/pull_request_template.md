## Summary
- What changed?
- Why did it change?

## Scope
- [ ] API contract/schema changed
- [ ] Database migration included (if schema changed)
- [ ] Multi-tenant scope validated (`tenant_id`)
- [ ] Observability updated (logs/metrics)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual validation executed (describe below)

Manual validation notes:
- 

## Security Checklist
- [ ] External input validated (DTO/schema + limits)
- [ ] AuthZ checked on all affected endpoints
- [ ] Sensitive data not logged
- [ ] Abuse protection reviewed (rate limit/backoff)
- [ ] New dependencies justified

## Risk and Rollback
- Risk level: `Low | Medium | High`
- Rollback plan:
