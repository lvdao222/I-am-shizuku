/**
 * i-am-Nyaacho shizuku — node half (legacy path, dsh < 0.1.7 only).
 *
 * On dsh >= 0.1.7 this row is `disabled` in cordis.patch.yml: the preset is
 * declared there as an `@deepseek-ai/dsh-agent-preset` composition row, and the
 * `.agent-presets/` directory scan no longer exists. On 0.1.6 hosts this plugin
 * mounts and idempotently deploys the packaged Nyaacho shizuku (猫娘) persona preset from
 * `template/` to `<dshHome>/.agent-presets/Nyaacho shizuku/`. Skips if the target already
 * exists so it never overwrites an edited preset. The persona ships with the
 * full DSH toolchain — shell, filesystem, goals, subagents, workflows, web —
 * with the skill toolchain trimmed and no concurrency anchor sync.
 */
import { mkdir, cp } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

export const name = 'i-am-Nyaacho shizuku'

const PRESET_NAME = 'Nyaacho shizuku'
// 插件包根目录：lib/index.js 的上两级即包根。内置预设模板随包携带，
// 安装时幂等铺设到 <dshHome>/.agent-presets/Nyaacho shizuku/（存在则不覆盖）。
const PKG_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TEMPLATE_PRESET = join(PKG_ROOT, 'template')

const expandHome = (p) => (p === '~' ? os.homedir() : /^~[\\/]/.test(p) ? join(os.homedir(), p.slice(2)) : p)
const dshHome = () => (process.env.DSH_HOME ? expandHome(process.env.DSH_HOME) : join(os.homedir(), '.dsh'))
const userPresetsDir = () => join(dshHome(), '.agent-presets')
const presetDir = () => join(userPresetsDir(), PRESET_NAME)

// 幂等铺设：目标目录已存在则跳过（绝不覆盖用户已编辑的预设）；可设
// DSH_Nyaacho shizuku_SKIP_DEPLOY=1 关闭，或 DSH_Nyaacho shizuku_REDEPLOY=1 强制覆盖。
async function ensurePreset() {
  if (process.env.DSH_Nyaacho shizuku_SKIP_DEPLOY === '1') return
  try {
    if (existsSync(presetDir()) && process.env.DSH_Nyaacho shizuku_REDEPLOY !== '1') return
    if (!existsSync(join(TEMPLATE_PRESET, 'agent.cordis.yml'))) return
    await mkdir(userPresetsDir(), { recursive: true })
    await cp(TEMPLATE_PRESET, presetDir(), { recursive: true, force: process.env.DSH_Nyaacho shizuku_REDEPLOY === '1' })
  } catch (e) {
    console.warn(`i-am-Nyaacho shizuku: preset deploy skipped for "${PRESET_NAME}"`, e)
  }
}

export async function apply(ctx) {
  await ensurePreset()
}