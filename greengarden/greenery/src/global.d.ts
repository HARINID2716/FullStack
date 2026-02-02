// Minimal global declarations to satisfy editor/TS server for node types used in node_modules
declare var Buffer: any;
declare type Buffer = any;

declare namespace NodeJS {
  // ReadableStream from node is used as a type in some libs; provide a minimal alias
  interface ReadableStream {}
}
