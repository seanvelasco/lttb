// Can be decoupled from Philips code for use in other projects that use time-series data

const LTTB = (series: number[][], threshold: number): number[][] | {[key: string]: number}[] => {

    // Convert 1D array number[n=1][] or object {[key: string]: number}[] to 2D array number[n=2][]

    if (series.every(item => item.constructor.name === 'Object')) {
        // If series is an object, convert to 2D array
        series = series.map(item => Object.values(item))
    }

    else if (series.every(item => item instanceof Number)) {
        // If given a 1D array, convert to 2D array
        series = series.map((value, count) => [count, value[count]])
    }

    // Threshhold check

    const seriesLength = series.length

    if (threshold >= seriesLength || threshold === 0) { // If target series is less than inputted series, nothing to downsample
        return series // If threshhold is zero, nothing to downsample
    }

    if (threshold === 1) { // Downsampling line into a point is not possible
        return [[series[0][0], series[0][1]]] // Design decision, however, to return a point
    }

    // Begin downsampling

    const downsampled: number[][] = []
    let sampledIndex = 0
    let bucket = (seriesLength - 2) / (threshold - 2)
    let point: number = 0
    let nextPoint: number = 0
    let area: number
    let maxAreaPoint: number[] = []
    let maxArea: number

    downsampled[sampledIndex++] = series[point]

    for (let count = 0; count < threshold - 2; count++) {
        let averageX = 0
        let averageY = 0
        let averageRangeStart = Math.floor((count + 1) * bucket) + 1
        let averageRangeEnd = Math.floor((count + 2) * bucket) + 1

        if (averageRangeEnd > seriesLength) {
            averageRangeEnd = seriesLength
        }

        let averageRangeLength = averageRangeEnd - averageRangeStart

        if (averageRangeStart > averageRangeEnd) {
            averageRangeStart++
        }

        if (averageRangeStart < averageRangeEnd) {
            averageX = averageX + series[averageRangeStart][0]
            averageY = averageY + series[averageRangeStart][1]
        }

        averageX = averageX / averageRangeLength
        averageY = averageY / averageRangeLength

        let rangeOffs = Math.floor((count + 0) * bucket) + 1
        let rangeTo = Math.floor((count + 1) * bucket) + 1
        let pointBucketX = series[point][0]
        let pointBucketY = series[point][1]

        maxArea = -1
        area = -1

        while (rangeOffs < rangeTo) {

            area = Math.abs((pointBucketX - averageX) * (series[rangeOffs][1] - pointBucketY) - (pointBucketX - series[rangeOffs][0]) * (averageY - pointBucketY)) * 0.5;

            if (area > maxArea) {
                maxArea = area
                maxAreaPoint = series[rangeOffs]
                nextPoint = rangeOffs
            }
            rangeOffs++
        }

        downsampled[sampledIndex++] = maxAreaPoint
        point = nextPoint
    }

    downsampled[sampledIndex++] = series[seriesLength - 1]

    if (downsampled.length !== threshold) {
        throw new Error('Something went wrong with downsampling')
    }

    const downsampledObject: { [key: string]: number }[] = []

    for (let index in downsampled) {
        downsampledObject[index] = {
            x: downsampled[index][0],
            y: downsampled[index][1]
        }
    }

    return downsampledObject
}

export default LTTB