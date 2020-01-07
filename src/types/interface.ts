interface Array<T> {
    unique(idGetter: (item: any) => any): Array<T>;
}
