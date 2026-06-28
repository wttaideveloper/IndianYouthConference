import { spawn, execSync } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function getListenPids(port) {
  if (process.platform !== 'win32') return []
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: 'utf8' },
    )
    return [...new Set(out.split(/\s+/).map((s) => s.trim()).filter(Boolean))]
  } catch {
    return []
  }
}

function isPortInUse(port) {
  if (getListenPids(port).length > 0) return true

  return new Promise((resolve) => {
    const probe = net.createServer()
    probe.once('error', () => resolve(true))
    probe.once('listening', () => probe.close(() => resolve(false)))
    probe.listen({ port, host: '0.0.0.0' })
  })
}

async function assertPortsFree() {
  const blocked = []
  for (const port of [3001, 5173]) {
    if (await isPortInUse(port)) blocked.push(port)
  }
  if (blocked.length === 0) return

  console.error(`\nPort${blocked.length > 1 ? 's' : ''} ${blocked.join(', ')} already in use.`)

  for (const port of blocked) {
    for (const pid of getListenPids(port)) {
      try {
        const info = execSync(
          `powershell -NoProfile -Command "(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).ProcessName"`,
          { encoding: 'utf8' },
        ).trim()
        console.error(`  port ${port} → PID ${pid} (${info || 'unknown'})`)
      } catch {
        console.error(`  port ${port} → PID ${pid}`)
      }
    }
  }

  console.error('\nStop the old dev server (Ctrl+C in that terminal), or run:')
  console.error('  npx kill-port 3001 5173')
  console.error('If that fails, force-kill the PID(s) above:')
  console.error('  Stop-Process -Id <PID> -Force\n')
  process.exit(1)
}

await assertPortsFree()

function run(label, command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  })
  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${label}] stopped (${signal})`)
    } else if (code !== 0 && code !== null) {
      console.log(`[${label}] exited with code ${code}`)
    }
    shutdown()
  })
  return child
}

const server = run('server', 'node', ['--env-file=.env', '--watch', 'server/index.js'])
const client = run('client', 'node', ['node_modules/vite/bin/vite.js'])

let stopping = false
function shutdown() {
  if (stopping) return
  stopping = true
  server.kill()
  client.kill()
  process.exit()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
