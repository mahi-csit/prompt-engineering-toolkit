# Playground Blank Page Fix - Testing Guide

## Overview
Fixed the Playground blank page issue by adding comprehensive error handling, validation, and error boundary components. The fix includes logging at each step to help diagnose issues if they recur.

## What Was Fixed

### 1. **Error Handling in `handleQuickTest`**
   - Added try-catch wrapper around API call
   - Validates response structure before updating state
   - Provides detailed error messages to user
   - Logs all steps to browser console for debugging

### 2. **Response Validation**
   - Checks if response object is null/undefined
   - Verifies responses array exists and is valid
   - Ensures each response has required fields
   - Prevents setting invalid data to state

### 3. **Error Boundary Component**
   - Catches React rendering errors
   - Displays user-friendly error messages
   - Shows expandable error stack for debugging
   - Provides recovery with "Try Again" button

### 4. **ModelComparison Improvements**
   - Validates input props thoroughly
   - Handles invalid response objects
   - Safe fallbacks for missing data
   - Friendly error messages

## Quick Test Procedure

### Prerequisites
- Backend server running (check `backend/.env` for API keys)
- Frontend dev server running
- Mock provider should always be available (no API keys needed)

### Test Steps

#### Test 1: Basic Functionality - Demo Models
1. Open http://localhost:5173 (or your frontend URL)
2. Navigate to **Playground** page
3. In the left panel, select:
   - ✅ Demo Fast
   - ✅ Demo Creative
4. In the prompt textarea, enter: `write a joke on unemployment`
5. Click **"Run Comparison"** button
6. **Expected Result:**
   - Brief loading spinner appears
   - Two response cards appear side-by-side
   - Each shows the model's response text
   - Each shows latency time (in milliseconds)
   - No error messages visible

#### Test 2: Single Model
1. Clear previous selections
2. Select only **Demo Fast**
3. Enter prompt: `explain machine learning in simple terms`
4. Click **"Run Comparison"**
5. **Expected Result:**
   - One response card appears
   - Response contains an explanation about machine learning
   - Success badge shows green with checkmark

#### Test 3: Three Models
1. Select:
   - ✅ Demo Fast
   - ✅ Demo Creative
   - ✅ Demo Detailed
2. Enter prompt: `what is climate change?`
3. Click **"Run Comparison"**
4. **Expected Result:**
   - Three response cards appear in a grid
   - Demo Fast: concise 2-3 sentence response
   - Demo Creative: fun response with emojis
   - Demo Detailed: comprehensive multi-paragraph response
   - All show success status and latency

#### Test 4: Error Handling - Empty Prompt
1. Leave prompt field empty
2. Click **"Run Comparison"**
3. **Expected Result:**
   - Error banner appears at top: "Please enter a prompt"
   - No API call made

#### Test 5: Error Handling - No Model Selected
1. Enter a prompt: `test prompt`
2. Clear all model selections (uncheck all)
3. Click **"Run Comparison"**
4. **Expected Result:**
   - Error banner appears: "Please select at least one model"
   - No API call made

#### Test 6: Clear Button
1. Enter a prompt with multiple models selected
2. Run a comparison (wait for results)
3. Click **"Clear"** button
4. **Expected Result:**
   - Prompt field clears
   - All error messages disappear
   - Results section shows placeholder: "Enter a prompt and select models..."

## Debugging Steps

### If Blank Page Still Appears

1. **Open Browser Developer Tools** (F12)
   
2. **Check Console Tab** for messages:
   - Should see: `Starting comparison with models: [...]`
   - Should see: `Received response: {...}`
   - Should see: `Response validation passed, setting results`
   - Look for any red error messages

3. **Check Network Tab**:
   - Look for request to `/playground/compare`
   - Response should show HTTP 200
   - Response body should contain:
     ```json
     {
       "prompt": "...",
       "responses": [...],
       "total_latency_ms": ...,
       "success_count": ...,
       "failure_count": ...
     }
     ```

4. **If error appears in console**:
   - Read error message for details
   - Common issues:
     - "Response.responses is not an array" → API returning wrong format
     - "Response missing response data" → Missing field in response
     - Network error → Backend connection issue

### If Error Boundary Catches Error

1. **Error message displays** with "Something went wrong"
2. **Stack trace is expandable** - click "Error Details" to see it
3. **Click "Try Again"** to recover
4. Copy stack trace to fix issues

## Expected API Response Format

The validation checks for this exact format:

```json
{
  "prompt": "your prompt text here",
  "responses": [
    {
      "provider": "mock",
      "model": "demo-fast",
      "response": "The actual response text here",
      "error": null,
      "latency_ms": 45,
      "success": true
    },
    {
      "provider": "mock",
      "model": "demo-creative",
      "response": "Another response 🎉",
      "error": null,
      "latency_ms": 52,
      "success": true
    }
  ],
  "total_latency_ms": 97,
  "success_count": 2,
  "failure_count": 0
}
```

## Testing with Real Providers (Optional)

If you have API keys set up:

1. Add API keys to `backend/.env`:
   ```
   OPENAI_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   ANTHROPIC_API_KEY=your_key_here
   ```

2. Models from those providers will appear in the list

3. Test same flow as above with real models

4. Should work identically

## Temperature and Max Tokens Testing

1. Adjust **Temperature** slider (0-1):
   - Lower values (0.1) = more deterministic responses
   - Higher values (0.9) = more creative/varied responses

2. Adjust **Max Tokens** (1-8192):
   - Lower values = shorter responses
   - Higher values = longer responses

3. These should affect response length/creativity

## Performance Notes

- Mock provider responses should appear within **100ms**
- Real API responses will vary (typically 1-5 seconds)
- Loading spinner should briefly appear during request
- All responses display in grid layout (auto-columns on mobile)

## Success Criteria

✅ All tests pass without blank page
✅ Responses appear after clicking "Run Comparison"
✅ Error messages are helpful and visible
✅ Console shows debug logs
✅ Clear button works properly
✅ No JavaScript errors in console
✅ Error boundary only triggers if real error occurs
✅ Recovery from errors works with "Try Again"

## Files Changed

1. **Playground.jsx** - Enhanced error handling
2. **ModelComparison.jsx** - Defensive validation
3. **ErrorBoundary.jsx** - New error boundary (NEW)

All changes are backward compatible and don't affect other features.
