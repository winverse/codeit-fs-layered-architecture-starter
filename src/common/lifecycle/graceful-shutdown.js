import { EXIT_CODE } from '#constants';

// 정상 종료 처리(graceful shutdown)
// 서버를 끌 때 프로그램을 바로 멈추면 처리 중이던 요청은 응답을 받지 못하고,
// 데이터베이스 연결도 정리되지 않은 채 끊깁니다.
// 정상 종료 처리는 종료 신호를 받으면 새 요청을 더 받지 않고, 처리 중인 요청이 끝나기를 기다린 뒤
// 서버 → 데이터베이스 연결 순서로 닫고 나서 프로그램을 끝내는 방식입니다.
// server는 app.listen()이 돌려준 HTTP 서버, db는 데이터베이스 연결 객체입니다.
export const setupGracefulShutdown = (server, db) => {
  // 종료 신호를 받으면 실행할 함수입니다. signal에는 받은 신호 이름('SIGINT' 등)이 들어옵니다.
  const shutdown = async (signal) => {
    console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);

    try {
      // 1. 서버를 닫습니다.
      // server.close()는 새 연결을 더 받지 않고, 처리 중인 요청까지 끝나 모든 연결이 닫히면 콜백을 실행합니다.
      // 콜백 방식의 함수이므로 await로 끝날 때까지 기다릴 수 있도록 Promise로 감쌉니다.
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('서버가 종료되었습니다.');

      // 2. 데이터베이스 연결을 닫습니다.
      // 처리 중인 요청이 데이터베이스를 쓰고 있을 수 있으므로 서버를 먼저 닫은 뒤에 닫습니다.
      await db.close();
      console.log('데이터베이스 연결이 종료되었습니다.');

      // 3. 서버와 데이터베이스 연결을 모두 닫았으므로 정상 종료 코드로 끝냅니다.
      process.exit(EXIT_CODE.SUCCESS);
    } catch (error) {
      console.error('서버 또는 데이터베이스 종료 중 에러:', error);
      // 닫는 도중 오류가 났으므로 오류 종료 코드로 끝냅니다.
      process.exit(EXIT_CODE.FAILURE);
    }
  };

  // process.on(신호, 함수)는 운영체제가 보낸 종료 신호를 받으면 함수를 실행하도록 등록합니다.
  // SIGINT: 터미널에서 Ctrl + C를 누르면 보내는 종료 신호입니다.
  // SIGTERM: 다른 프로그램(kill 명령, 배포 도구 등)이 종료를 요청할 때 보내는 신호입니다.
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};
