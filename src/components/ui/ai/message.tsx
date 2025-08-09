import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from '@/components/ui/avatar';
  import type { ComponentProps, HTMLAttributes } from 'react';
  import { cn } from '@/lib/utils';
  
  export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
    from: 'user' | 'assistant';
  };
  
  export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
    <div
      className={cn(
        'group flex w-full items-end justify-end gap-2 py-4',
        from === 'user' ? 'is-user' : 'is-assistant flex-row-reverse justify-end',
        '[&>div]:max-w-[80%]',
        className
      )}
      {...props}
    />
  );
  
  export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;
  
  export const AIMessageContent = ({
    children,
    className,
    ...props
  }: AIMessageContentProps) => (
    <div
      className={cn(
        'flex flex-col gap-2 px-0.5 py-1 leading-relaxed border-border',
        'bg-background text-foreground',
        'group-[.is-user]:bg-background group-[.is-user]:text-foreground border-b ',
        className
      )}
      {...props}
    >
      <div className="is-user:dark text-wrap overflow-x-auto">{children}</div>
    </div>
  );
  
  export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
    src: string;
    name?: string;
  };
  
  export const AIMessageAvatar = ({
    src,
    name,
    className,
    ...props
  }: AIMessageAvatarProps) => (
    <Avatar className={cn('size-8', className)} {...props}>
      <AvatarImage alt="" className="mt-0 mb-0" src={src} />
      <AvatarFallback className='bg-transparent text-xs'>{name?.slice(0, 3) || 'ME'}</AvatarFallback>
    </Avatar>
  );
  