"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConversationHistory } from "@/components/ui/conversation-history";
import { useChatStore } from "@/store/chatStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Settings, 
  User,
  Home,
  LogIn,
  UserPlus,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createNewConversation } from "@/lib/chat-helpers";
import { useAuth } from "@/context/AuthContext";
import { startSyncService, stopSyncService } from "@/lib/sync-service";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Auth context
  const { user, signOut, isLoading: authLoading } = useAuth();
  
  // Chat store state
  const { 
    currentConversation, 
    setCurrentConversation,
    conversations,
    loadConversationsFromLocalStorage
  } = useChatStore();

  // Check if we're on a chat page
  const isChatPage = pathname?.includes("/chat/");

  // Load conversations from localStorage on mount
  useEffect(() => {
    loadConversationsFromLocalStorage();
    
    // Start sync service
    startSyncService();
    
    return () => {
      // Stop sync service on unmount
      stopSyncService();
    };
  }, [loadConversationsFromLocalStorage]);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Create a new chat and navigate to it
  const handleNewChat = async () => {
    // Create a new conversation with a local ID
    const newConversation = createNewConversation("Hi! I'm ready to start.");
    
    // Set as current conversation
    setCurrentConversation(newConversation);
    
    // Navigate to the new conversation
    router.push(`/chat/${newConversation.id}`);
    
    // Close mobile sidebar
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      
      // Close mobile sidebar
      if (isMobile) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Toggle sidebar collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Render the sidebar content
  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4">
        <div className={cn("flex items-center gap-2", isCollapsed && "hidden")}>
          <h1 className="text-xl font-semibold">AI Routine</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="px-3 mb-4">
        <Button
          onClick={handleNewChat}
          className={cn(
            "flex items-center gap-2 w-full justify-start",
            isCollapsed && "justify-center p-2"
          )}
          variant="outline"
        >
          <Plus size={16} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-3">
        {!isCollapsed && (
          <ConversationHistory 
            onNewChat={handleNewChat}
          />
        )}
      </div>

      <div className="mt-auto border-t border-foreground/10">
        <div className="p-3">
          <nav className="space-y-1">
            <Link href="/" passHref>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center gap-2 justify-start",
                  isCollapsed && "justify-center p-2",
                  pathname === "/" && "bg-muted"
                )}
              >
                <Home size={18} />
                {!isCollapsed && <span>Home</span>}
              </Button>
            </Link>
            
            {user ? (
              <>
                <Link href="/settings" passHref>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-2 justify-start",
                      isCollapsed && "justify-center p-2",
                      pathname === "/settings" && "bg-muted"
                    )}
                  >
                    <Settings size={18} />
                    {!isCollapsed && <span>Settings</span>}
                  </Button>
                </Link>
                <Link href="/profile" passHref>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full flex items-center gap-2 justify-start",
                      isCollapsed && "justify-center p-2",
                      pathname === "/profile" && "bg-muted"
                    )}
                  >
                    <User size={18} />
                    {!isCollapsed && <span>Profile</span>}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-2 justify-start",
                    isCollapsed && "justify-center p-2"
                  )}
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  {!isCollapsed && <span>Sign Out</span>}
                </Button>
              </>
            ) : (
              !authLoading && (
                <>
                  <Link href="/signin" passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full flex items-center gap-2 justify-start",
                        isCollapsed && "justify-center p-2",
                        pathname === "/signin" && "bg-muted"
                      )}
                    >
                      <LogIn size={18} />
                      {!isCollapsed && <span>Sign In</span>}
                    </Button>
                  </Link>
                  <Link href="/signup" passHref>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full flex items-center gap-2 justify-start",
                        isCollapsed && "justify-center p-2",
                        pathname === "/signup" && "bg-muted"
                      )}
                    >
                      <UserPlus size={18} />
                      {!isCollapsed && <span>Sign Up</span>}
                    </Button>
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </>
  );

  // Mobile sidebar toggle button
  const renderMobileToggle = () => (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden"
      onClick={toggleMobileSidebar}
    >
      {isOpen ? <ChevronLeft size={18} /> : <MessageSquare size={18} />}
    </Button>
  );

  // If mobile, render a drawer-style sidebar
  if (isMobile) {
    return (
      <>
        {renderMobileToggle()}
        
        {/* Mobile sidebar overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={toggleMobileSidebar}
          />
        )}
        
        {/* Mobile sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-foreground/10 shadow-lg transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {renderSidebarContent()}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "h-screen sticky top-0 border-r border-foreground/10 flex flex-col bg-background transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {renderSidebarContent()}
    </div>
  );
}