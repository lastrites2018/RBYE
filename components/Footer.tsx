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
      <div>
        이 사이트는{" "}
        <a href="/www.wanted.co.kr/" target="_blank">
          Wanted
        </a>
        의 데이터에 기반하며, 비영리적인 목적으로 사용합니다.
      </div>
    </footer>
  );
};

export default Footer;
