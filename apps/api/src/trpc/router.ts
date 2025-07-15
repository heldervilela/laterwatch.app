import * as authProcedures from '../domain/auth/procedures'
import * as tagsProcedures from '../domain/tags/procedures'
import * as usersProcedures from '../domain/users/procedures'
import * as videoProgressProcedures from '../domain/video-progress/procedures'
import * as videosProcedures from '../domain/videos/procedures'
import { router } from './procedures'

// Sub-router para autenticação
const authRouter = router({
  sendVerificationCode: authProcedures.sendVerificationCode,
  verifyCode: authProcedures.verifyCode,
  refreshToken: authProcedures.refreshToken,
  logout: authProcedures.logout,
})

// Sub-router para utilizadores
const usersRouter = router({
  me: usersProcedures.me,
})

// Sub-router para vídeos
const videosRouter = router({
  createVideo: videosProcedures.createVideo,
  updateVideo: videosProcedures.updateVideo,
  deleteVideo: videosProcedures.deleteVideo,
  addTagsToVideo: videosProcedures.addTagsToVideo,
  removeTagsFromVideo: videosProcedures.removeTagsFromVideo,
  getUserVideos: videosProcedures.getUserVideos,
  getUserUnwatchedVideos: videosProcedures.getUserUnwatchedVideos,
  markVideoAsWatched: videosProcedures.markVideoAsWatched,
})

// Sub-router para tags
const tagsRouter = router({
  createTag: tagsProcedures.createTag,
  updateTag: tagsProcedures.updateTag,
  deleteTag: tagsProcedures.deleteTag,
  getUserTags: tagsProcedures.getUserTags,
})

// Sub-router para progresso dos vídeos
const videoProgressRouter = router({
  getVideoProgress: videoProgressProcedures.getVideoProgress,
  updateVideoProgress: videoProgressProcedures.updateVideoProgress,
})

// Router principal com namespaces
export const appRouter: ReturnType<typeof router> = router({
  auth: authRouter,
  users: usersRouter,
  videos: videosRouter,
  tags: tagsRouter,
  videoProgress: videoProgressRouter,
})

// Exportar tipo para o frontend
export type AppRouter = typeof appRouter
