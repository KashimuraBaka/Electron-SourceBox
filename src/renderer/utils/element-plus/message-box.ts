import type { ElMessageBoxOptions } from 'element-plus'
import type { AppContext } from 'vue'

export const ConfirmAsync = async (
  message: ElMessageBoxOptions['message'],
  title: ElMessageBoxOptions['title'],
  options?: ElMessageBoxOptions,
  appContext?: AppContext | null
) => {
  return await ElMessageBox.confirm(message, title, options, appContext)
    .then(() => true)
    .catch(() => false)
}
