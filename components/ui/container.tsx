interface ContainerProps {
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
    children
}) => {
    return (
        <div className="mx-auto max-w-7xl px-12 pb-12">
            {children}
        </div>
    )
}

export default Container;