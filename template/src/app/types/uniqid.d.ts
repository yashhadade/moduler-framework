declare module 'uniqid' {
  function uniqid(prefix?: string, suffix?: string): string;
  namespace uniqid {
    function process(prefix?: string, suffix?: string): string;
    function time(prefix?: string, suffix?: string): string;
  }
  export = uniqid;
}
