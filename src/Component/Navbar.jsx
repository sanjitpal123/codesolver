function Navbar() {
    return (
      <div className="navbar bg-gray-600 text-white block md:hidden z-50 fixed top-0">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
          
          </div>
        </div>
        <div className="navbar-center">
          <a className="btn btn-ghost text-xl">ChatSolver</a>
        </div>
       
      </div>
    );
  }
  
  export default Navbar;
  