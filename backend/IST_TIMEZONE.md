# Indian Standard Time (IST) Implementation

## Overview
All time-based unlocking features now use **Indian Standard Time (IST)** which is **UTC+5:30**.

## What Changed

### 1. New Timezone Utility (`utils/timezone.js`)

**Functions Available:**
- `getCurrentIST()` - Get current time in IST
- `toIST(date)` - Convert any date to IST
- `canUnlockInIST(unlockDate)` - Check if unlock time has passed in IST
- `getTimeUntilUnlockIST(unlockDate)` - Get milliseconds until unlock in IST
- `formatIST(date)` - Format date as IST string
- `getStartOfDayIST(date)` - Get start of day in IST
- `getEndOfDayIST(date)` - Get end of day in IST

### 2. Updated Models

#### Capsule Model (`models/Capsule.js`)
- ✅ `unlock()` method now uses IST
- ✅ Checks `canUnlockInIST()` before unlocking
- ✅ Sets `unlockedAt` to current IST time

#### JournalEntry Model (`models/JournalEntry.js`)
- ✅ `canUnlock()` method uses IST
- ✅ `unlock()` method uses IST
- ✅ Time capsule journal entries unlock in IST

#### LotteryCapsule Model (`models/LotteryCapsule.js`)
- ✅ `unlock()` method uses IST
- ✅ Daily lottery unlocks based on IST

### 3. Updated Controllers

#### Capsule Controller (`controllers/capsuleController.js`)
- ✅ Imported IST utility functions
- ✅ Time checks use IST

#### Lottery Controller (`controllers/lotteryController.js`)
- ✅ `timeUntilUnlock` calculated in IST
- ✅ Lottery unlock checks use IST

## How It Works

### Time Conversion
```javascript
// UTC time
const utc = new Date();

// Convert to IST (add 5 hours 30 minutes)
const ist = toIST(utc);
```

### Unlock Check Example
```javascript
// Old way (using server's local time)
if (new Date() >= unlockDate) {
  // unlock
}

// New way (using IST)
if (canUnlockInIST(unlockDate)) {
  // unlock
}
```

### Time Until Unlock
```javascript
// Old way
const timeUntil = unlockDate - new Date();

// New way (IST)
const timeUntil = getTimeUntilUnlockIST(unlockDate);
```

## Features Using IST

### 1. Time Capsules
- **Unlock Date:** Set by user
- **Check:** Every access checks against IST
- **Unlock:** Only when current IST >= unlock date IST

**Example:**
```
User creates capsule: 2025-01-15 10:00 AM IST
Current time: 2025-01-15 09:59 AM IST → Locked
Current time: 2025-01-15 10:00 AM IST → Can unlock
```

### 2. Lottery System
- **Daily Generation:** Uses IST to determine day
- **Unlock Timer:** Countdown in IST
- **Time Remaining:** Calculated from current IST

**Example:**
```
Lottery created: Today 12:00 AM IST
Unlock time: Tomorrow 12:00 AM IST
Time remaining: Calculated in IST timezone
```

### 3. Journal Entry Capsules
- **Lock Type: Time:** Uses IST
- **Unlock Check:** IST-based
- **Unlock At:** Recorded in IST

### 4. Scheduled Tasks
- **Cron Jobs:** Run based on server time
- **But checks:** Use IST for unlock validation
- **Notifications:** Sent based on IST unlock times

## Benefits

1. **Consistency** ✅
   - All users see same unlock times
   - No confusion with server timezone
   - Matches Indian users' expectations

2. **Reliability** ✅
   - Unlock times are predictable
   - Works regardless of server location
   - Consistent across deployments

3. **User Experience** ✅
   - Times match user's wall clock (for Indian users)
   - No mental timezone conversion needed
   - Clear and understandable

## Testing

### Test Unlock in IST
```javascript
const unlockDate = new Date('2025-01-15T10:00:00+05:30');
const canUnlock = canUnlockInIST(unlockDate);
console.log('Can unlock:', canUnlock);
```

### Test Time Remaining
```javascript
const unlockDate = new Date('2025-01-15T10:00:00+05:30');
const timeLeft = getTimeUntilUnlockIST(unlockDate);
console.log('Time left (ms):', timeLeft);
console.log('Time left (hours):', timeLeft / (1000 * 60 * 60));
```

### Format IST Time
```javascript
const date = new Date();
const formatted = formatIST(date);
console.log('IST:', formatted);
// Output: "15 January 2025, 10:30:45"
```

## Implementation Details

### IST Offset
- **UTC Offset:** +5:30 (330 minutes)
- **Calculation:** `UTC time + 330 minutes`
- **Timezone:** `Asia/Kolkata`

### Unlock Logic
```javascript
// In models
if (!canUnlockInIST(this.unlockDate)) {
  throw new Error('Capsule not ready to unlock yet (IST)');
}

this.isUnlocked = true;
this.unlockedAt = getCurrentIST();
```

### Frontend Display
Frontend receives:
- `unlockDate` - ISO string
- `timeUntilUnlock` - milliseconds (IST-based)

Frontend can display countdown using `timeUntilUnlock` value which is already calculated in IST.

## Migration Notes

### Existing Capsules
- ✅ No migration needed
- ✅ Unlock dates stored as UTC in MongoDB
- ✅ Comparison done in IST automatically
- ✅ Works for all existing capsules

### Backward Compatibility
- ✅ Old unlock checks still work
- ✅ New checks use IST
- ✅ No data structure changes
- ✅ Gradual rollout possible

## Error Messages

All unlock errors now include "(IST)" to clarify timezone:
- `"Capsule not ready to unlock yet (IST)"`
- `"Entry cannot be unlocked yet (IST)"`
- `"Capsule is not ready to be unlocked yet (IST)"`

## Summary

**All time-based unlock features now use IST (UTC+5:30) for:**
- ✅ Time Capsules
- ✅ Journal Entry Capsules  
- ✅ Lottery Capsules
- ✅ Unlock time checks
- ✅ Time remaining calculations
- ✅ Scheduled unlocks

**This ensures consistent unlock times for all users, especially those in India!** 🇮🇳⏰

