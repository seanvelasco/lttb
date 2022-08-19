## What is LTTB?

Largest Triangle Three Buckets is a downsampling algorithm for time series data.

## Installation

```
npm install @seanvelasco/lttb
```

## Usage

```typescript
import LTTB from '@seanvelasco/lttb'

const threshold = 300

const untreatedData = [...]

// Accepts an array of numbers (number[]) or typed arrays (Uint8Array, Uint16Array, Uint32Array, etc)

const downsampledData = LTTB(untreatedData, threshold)
```