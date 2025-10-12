import * as React from 'react';

export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <table className={className ?? 'w-full text-sm'} {...props} />
);

export const Tr = (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />;
export const Th = (props: React.ThHTMLAttributes<HTMLTableCellElement>) => <th {...props} />;
export const Td = (props: React.TdHTMLAttributes<HTMLTableCellElement>) => <td {...props} />;
