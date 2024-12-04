// components/layout/NoSidebarLayout.tsx
const NoSidebarLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen">
        {/* This layout will not include the sidebar */}
        <main>{children}</main>
      </div>
    )
  }
  
  export default NoSidebarLayout;
  