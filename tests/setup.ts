import "vitest";

Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    subtle: {},
    randomUUID: () => "00000000-0000-0000-0000-000000000000",
  },
});
