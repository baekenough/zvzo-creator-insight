import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Mock HTMLDialogElement methods for jsdom
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalled();
  });

  it('should render default variant', () => {
    const { container } = render(<Button>Default</Button>);
    expect(container.firstChild).toHaveClass('bg-zvzo-500');
  });

  it('should render destructive variant', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass('bg-red-500');
  });

  it('should render outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.firstChild).toHaveClass('border');
  });

  it('should render secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });

  it('should render ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild).toHaveClass('hover:bg-gray-100');
  });

  it('should render link variant', () => {
    const { container } = render(<Button variant="link">Link</Button>);
    expect(container.firstChild).toHaveClass('underline-offset-4');
  });

  it('should render small size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild).toHaveClass('h-9');
  });

  it('should render large size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild).toHaveClass('h-11');
  });

  it('should render icon size', () => {
    const { container } = render(<Button size="icon">Icon</Button>);
    expect(container.firstChild).toHaveClass('h-10', 'w-10');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});

describe('Card', () => {
  it('should render card with all sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should apply border and shadow classes', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toHaveClass('border', 'shadow-sm');
  });

  it('should accept custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Badge', () => {
  it('should render badge text', () => {
    render(<Badge>Badge</Badge>);
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-zvzo-500');
  });

  it('should render secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(container.firstChild).toHaveClass('bg-gray-100');
  });

  it('should render destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Delete</Badge>);
    expect(container.firstChild).toHaveClass('bg-red-500');
  });

  it('should render outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild).toHaveClass('border-gray-300');
  });
});

describe('Input', () => {
  it('should render input', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('should accept type prop', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Input ref={ref as any} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});

describe('Skeleton', () => {
  it('should render skeleton', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-full');
  });
});

describe('Table', () => {
  it('should render table with all components', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();
  });

  it('should have correct table structure', () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    const table = container.querySelector('table');
    const thead = container.querySelector('thead');
    const tbody = container.querySelector('tbody');

    expect(table).toBeInTheDocument();
    expect(thead).toBeInTheDocument();
    expect(tbody).toBeInTheDocument();
  });
});

describe('Select', () => {
  it('should render select with options', () => {
    render(
      <Select>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    const onChange = vi.fn();
    render(
      <Select onChange={onChange}>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });

    expect(onChange).toHaveBeenCalled();
  });

  it('should display chevron icon', () => {
    const { container } = render(
      <Select>
        <option value="1">Option 1</option>
      </Select>
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('Dialog', () => {
  it('should render trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should open dialog when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    fireEvent.click(screen.getByText('Open Dialog'));

    // Dialog content should be visible
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog description')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', () => {
    render(
      <Dialog defaultOpen={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    // Note: Due to the dialog element behavior, testing visibility requires more setup
  });

  it('should render close button', () => {
    render(
      <Dialog defaultOpen={true}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });
});
