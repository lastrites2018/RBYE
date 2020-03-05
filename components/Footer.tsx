const Footer = () => {
  return (
    <footer className="bg-light py-3 text-center">
      <div>
        Made by lastrites2018
        <a
          href="https://github.com/lastrites2018/RBYE"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="ml-2 inline-block"
            src="/github.png"
            alt="github"
            width="20"
            height="20"
          />
        </a>
      </div>
      <div className="break-word-and-keep-all">
        이 사이트는{" "}
        <a href="/www.wanted.co.kr/" target="_blank">
          Wanted
        </a>
        의 데이터에 기반하며, 비영리적인 목적으로 사용합니다.
        <p>
          데이터는 비정기적으로 업데이트 되기에 최신 데이터가 아닐 수 있습니다.
        </p>
        <p>구직의 목적이라면 직접 원티드 사이트를 방문하시길 권장합니다.</p>
      </div>
    </footer>
  );
};

export default Footer;
