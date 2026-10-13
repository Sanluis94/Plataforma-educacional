import type { SubmissionData } from '../../modules/data/types';
export function seedAuthorizedLearning(studentId='student-99',studentName='Mariana Silva',teacherId='prof-1',count=4){
  const ids=['fis_1','fis_2','fis_3','math_1'];
  const submissions:SubmissionData[]=ids.slice(0,count).map((id,index)=>({id:'earned-'+index,activityId:id,activityTitle:'Atividade '+index,classId:'class-1',studentId,studentName,status:'completed',score:100,submittedAt:new Date(Date.now()-3600000-index*60000).toISOString(),evidence:{schemaVersion:1,source:'lab',sessionId:'earned-'+index,stage:'assessment',labId:id,subject:'Física',activeSeconds:120,questions:[{questionId:'q',question:'Compare a relação observada.',selectedOption:0,correct:true,selectedText:'Relação correta',expectedText:'Relação correta'}]}}));
  const users=[{id:teacherId,role:'professor',name:'Professor de teste',email:'teacher@example.test',createdAt:new Date().toISOString()},{id:studentId,role:'estudante',name:studentName,email:'student@example.test',createdAt:new Date().toISOString()}];
  localStorage.setItem('edu_local_db',JSON.stringify({users,classes:[{id:'class-1',name:'Turma de teste',code:'ABC234',professorId:teacherId,studentIds:[studentId],studentsCount:1,createdAt:new Date().toISOString()}],submissions,activities:[],progress:{[studentId]:{level:1,xp:0,coins:0,completedModules:ids.slice(0,count),purchasedItems:[],enrolledClasses:['class-1']}},learningEvents:[],systemLogs:[]}));
  function login(role:'professor'|'estudante'){const profile=users.find(value=>value.role===role)!;localStorage.setItem('edu-interact-local-auth-session',JSON.stringify({currentUser:{uid:profile.id,email:profile.email,displayName:profile.name},userData:{role,name:profile.name,email:profile.email,gradeLevel:'medio'}}));}
  login('professor');
  return {submissions,login,options:{classId:'class-1',issuerId:teacherId,requirements:{minimumCompleted:4,minScore:70}}};
}
