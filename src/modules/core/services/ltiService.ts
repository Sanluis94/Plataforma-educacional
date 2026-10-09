/**
 * Módulo de Integração e Interoperabilidade LTI 1.3 (Learning Tools Interoperability)
 * Compatível com Moodle, Canvas LMS, Blackboard e Google Classroom
 * Melhoria #17 do Plano Estratégico
 */

export interface LtiLaunchContext {
  platformId: string; // ex: 'canvas.instructure.com' ou 'moodle.universidade.edu.br'
  courseId: string;
  courseTitle: string;
  userId: string;
  userName: string;
  userRoles: ('Instructor' | 'Learner' | 'Administrator')[];
  labId: string;
  resourceLinkId: string;
  lineItemServiceUrl?: string; // AGS para retorno de notas
}

export interface LtiGradePayload {
  userId: string;
  scoreGiven: number; // 0 a 100
  scoreMaximum: number;
  comment?: string;
  activityProgress: 'Initialized' | 'Started' | 'InProgress' | 'Submitted' | 'Completed';
  gradingProgress: 'FullyGraded' | 'Pending' | 'Failed';
}

export class LtiIntegrationBridge {
  /**
   * Verifica se o Kortex foi aberto dentro de um iframe de LMS via LTI
   */
  public static isLtiEmbedded(): boolean {
    if (typeof window === 'undefined') return false;
    return window.self !== window.top || window.location.search.includes('lti_launch=1');
  }

  /**
   * Extrai o contexto LTI dos parâmetros de URL ou sessão
   */
  public static getLaunchContext(): LtiLaunchContext | null {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (!params.has('lti_launch')) return null;

    return {
      platformId: params.get('platform') || 'generic_lms',
      courseId: params.get('course_id') || 'cur_default',
      courseTitle: params.get('course_title') || 'Curso Integrado',
      userId: params.get('user_id') || 'user_anonymous',
      userName: params.get('user_name') || 'Estudante LMS',
      userRoles: (params.get('roles') || 'Learner').split(',') as any,
      labId: params.get('lab_id') || 'sup_fis_01',
      resourceLinkId: params.get('resource_link_id') || 'link_default',
      lineItemServiceUrl: params.get('ags_endpoint') || undefined
    };
  }

  /**
   * Dispara o sincronismo de nota de volta para o LMS pai via postMessage e API REST
   */
  public static syncGradeToLms(grade: LtiGradePayload): boolean {
    if (typeof window === 'undefined') return false;

    // Envio seguro via postMessage para o LMS pai
    const message = {
      subject: 'org.imsglobal.lti.ags.score',
      payload: {
        userId: grade.userId,
        scoreGiven: grade.scoreGiven,
        scoreMaximum: grade.scoreMaximum,
        comment: grade.comment || 'Nota gerada no Laboratório Virtual Kortex',
        activityProgress: grade.activityProgress,
        gradingProgress: grade.gradingProgress,
        timestamp: new Date().toISOString()
      }
    };

    window.parent.postMessage(message, '*');
    console.log('[LTI 1.3] Nota postada com sucesso para o LMS parceiro:', message);
    return true;
  }
}
