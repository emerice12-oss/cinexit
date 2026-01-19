export let db: any = null
try {
  // Use require in a try/catch so bundlers that disallow static imports
  // outside the project root don't fail during build.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  db = require('../server/db').db
} catch (err) {
  // backend unavailable during this build — tolerate it
  db = null
}