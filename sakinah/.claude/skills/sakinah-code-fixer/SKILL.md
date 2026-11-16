# SAKINAH CODE FIXER | مصحح أكواد سكينة

**Version**: 1.0.0  
**Purpose**: Comprehensive code review, error detection, and automated fixes for SAKINAH AI project  
**الهدف**: فحص شامل لمشروع سكينة واكتشاف الأخطاء وإصلاحها

---

## 🎯 SKILL OVERVIEW

### المرحلة الأولى: Comprehensive Project Audit
1. **TypeScript Validation**
   - Run `npx tsc --noEmit` to detect all type errors
   - Check for `any` types and suggest proper typing
   - Verify strict mode compliance

2. **ESLint & Code Quality**
   - Run `npx expo lint` to identify style issues
   - Check import organization
   - Verify naming conventions

3. **Dependency Analysis**
   - Check `package.json` for outdated/conflicting versions
   - Verify all imports are properly declared
   - Identify unused dependencies

4. **File Structure Audit**
   - Scan for missing or duplicate files
   - Check path alias correctness (@components, @services, @screens, @utils)
   - Verify file naming conventions

5. **React Native & Expo Specific**
   - Check Expo Router configuration
   - Validate navigation paths
   - Verify platform-specific code

6. **Supabase Integration**
   - Validate Auth setup
   - Check Database RLS policies
   - Verify Storage bucket configurations
   - Test connection strings

### المرحلة الثانية: Error Classification

```
CRITICAL (🔴 MUST FIX)
├─ Type errors blocking compilation
├─ Missing dependencies
├─ Broken imports
└─ Security vulnerabilities

HIGH (🟠 IMPORTANT)
├─ ESLint errors
├─ Supabase connection issues
├─ Navigation failures
└─ API integration problems

MEDIUM (🟡 SHOULD FIX)
├─ Performance issues
├─ Code style violations
├─ Unused code
└─ Naming inconsistencies

LOW (🔵 NICE TO HAVE)
├─ Code comments
├─ Documentation gaps
└─ Minor refactoring opportunities
```

### المرحلة الثالثة: Incremental Fixes
- Apply fixes in order of severity
- Test after each fix
- Preserve working functionality
- Maintain backward compatibility
- Update dependencies carefully

### المرحلة الرابعة: Verification
1. **Type Check**: `npx tsc --noEmit`
2. **Lint Check**: `npx expo lint`
3. **Build Test**: Check if `npm run build` works
4. **iOS Simulator**: Verify app starts on simulator
5. **Console Check**: Zero errors/warnings in console

### المرحلة الخامسة: Testing
- Test critical flows: Auth, Audio Upload, Recitation Review
- Test navigation between screens
- Verify RTL/LTR support
- Check error handling
- Test on multiple screen sizes

### المرحلة السادسة: Final Report

Create comprehensive report with:
```
## ✅ Fixed Issues
- Issue #1: Description → Solution applied → Status: ✓

## ⚠️ Remaining Issues
- Issue #N: Description → Recommendation

## 📊 Statistics
- Total issues found: X
- Issues fixed: Y
- Success rate: Z%

## 🔄 Git Status
- Changes committed: Y/N
- Branch: main/feature
- Ready for deployment: Y/N
```

---

## 📋 RULES OF OPERATION

### ✅ MUST DO
1. **Scan First**: Always audit project before making changes
2. **Test After Each Fix**: Don't apply multiple fixes without testing
3. **Preserve Functionality**: Never break working features
4. **Use Real Data**: No dummy data to mask errors
5. **Document Changes**: Add commit messages explaining fixes
6. **Check Security**: Never expose API keys or secrets
7. **Follow Conventions**: Maintain existing code style
8. **Type Safety**: Ensure TypeScript strict mode compliance
9. **i18n Support**: Maintain RTL/LTR functionality
10. **Git Best Practices**: Small, focused commits

### ❌ MUST NOT DO
1. Delete files without verification they're unused
2. Modify another agent's code without coordination
3. Hardcode secrets or API keys
4. Leave `console.log()` in code
5. Use `any` type without exhausting alternatives
6. Ignore ESLint or TypeScript errors
7. Skip testing before committing
8. Suppress warnings without fixing root cause
9. Create merge conflicts
10. Claim success without verification

---

## 🔧 EXECUTION STEPS

```bash
# 1. Audit Phase
npx tsc --noEmit 2>&1 | tee /tmp/ts-errors.log
npx expo lint 2>&1 | tee /tmp/lint-errors.log
npm ls --all 2>&1 | tee /tmp/dependencies.log

# 2. Classification Phase
grep -r "import.*from" src/ | grep -v node_modules

# 3. Fix Phase
# Apply fixes incrementally

# 4. Verification Phase
npx tsc --noEmit
npx expo lint

# 5. Build Test
npm run build

# 6. Report Phase
# Generate comprehensive report
```

---

## 📝 DETECTION PATTERNS

### Common Issues to Find

1. **Import Errors**
   - `Cannot find module '@components/...'`
   - Circular dependencies
   - Missing re-exports

2. **Type Errors**
   - `Property '...' does not exist`
   - `Argument of type '...' is not assignable`
   - Missing type definitions

3. **React Native Specific**
   - Invalid prop usage
   - Missing SafeAreaView
   - Navigation path errors

4. **Supabase Issues**
   - Invalid auth tokens
   - RLS policy violations
   - Missing database tables

5. **Configuration Issues**
   - Invalid Expo Router setup
   - Missing environment variables
   - Incorrect path aliases

---

## 🚀 HOW TO USE THIS SKILL

Invoke with `/sakinah-code-fixer` to trigger the full audit and fix workflow:

```bash
/sakinah-code-fixer [--phase 1-6] [--severity critical|high|medium|low] [--fix-only] [--report-only]
```

### Options
- `--phase`: Run specific phase only
- `--severity`: Filter issues by severity
- `--fix-only`: Skip audit, only apply fixes
- `--report-only`: Skip fixes, only generate report

### Example Usage
```bash
/sakinah-code-fixer                      # Full audit + fix
/sakinah-code-fixer --phase 1            # Audit only
/sakinah-code-fixer --severity critical  # Critical fixes only
/sakinah-code-fixer --report-only        # Report only
```

---

## ✨ SUCCESS CRITERIA

✅ All TypeScript errors fixed  
✅ Zero ESLint errors (or explained exceptions)  
✅ All imports resolve correctly  
✅ App builds without errors  
✅ App starts in simulator without crashes  
✅ No console errors/warnings  
✅ All navigation works  
✅ Authentication functional  
✅ Audio features working  
✅ RTL/LTR support maintained  

---

## 📊 DELIVERABLES

1. **Fixed Code**: All issues corrected in working tree
2. **Git Commits**: Clean, focused commits with clear messages
3. **Comprehensive Report**: Detailed findings and recommendations
4. **Verification Log**: Evidence of testing and validation
5. **Updated Documentation**: Any necessary README/docs updates

---

**Last Updated**: 2026-11-16  
**Status**: 🚀 Ready for Deployment  
**Maintainer**: SAKINAH AI Team
